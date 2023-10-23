import {Change, Datum, MultiTokenValue} from '@emurgo/yoroi-lib/dist/internals/models'
import {Balance} from '@yoroi/types'

import {YoroiEntry, YoroiMetadata, YoroiUnsignedTx, YoroiVoting} from '../../types'
import {Amounts, Entries, Quantities} from '../../utils'
import {Cardano, CardanoMobile} from '../../wallets'
import {CardanoHaskellShelleyNetwork} from '../networks'
import {CardanoTypes} from '../types'

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkConfig,
  votingRegistration,
  addressedUtxos,
  entries,
}: {
  unsignedTx: CardanoTypes.UnsignedTx
  networkConfig: CardanoHaskellShelleyNetwork
  votingRegistration?: VotingRegistration
  addressedUtxos: CardanoTypes.CardanoAddressedUtxo[]
  entries?: YoroiEntry[]
}) => {
  const fee = toAmounts(unsignedTx.fee.values)
  const change = await toEntriesFromChange(unsignedTx.change)
  const outputsEntries = await toEntriesFromOutputs(unsignedTx.outputs)
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  entries = entries ?? Entries.remove(outputsEntries, changeAddresses)
  const stakingBalances = await Cardano.getBalanceForStakingCredentials(addressedUtxos)

  const yoroiTx: YoroiUnsignedTx = {
    entries,
    fee,
    change,
    staking: {
      withdrawals:
        unsignedTx.withdrawals.hasValue() && (await unsignedTx.withdrawals.len()) > 0
          ? await Staking.toWithdrawals(unsignedTx.withdrawals)
          : undefined,
      registrations:
        unsignedTx.registrations.length > 0
          ? await Staking.toRegistrations({registrations: unsignedTx.registrations, networkConfig})
          : undefined,
      deregistrations:
        unsignedTx.deregistrations.length > 0
          ? await Staking.toDeregistrations({deregistrations: unsignedTx.deregistrations, networkConfig})
          : undefined,
      delegations:
        unsignedTx.delegations.length > 0
          ? Staking.toDelegations({
              balances: stakingBalances,
              fee,
            })
          : undefined,
    },
    voting: {
      registration: votingRegistration
        ? Voting.toRegistration({
            votingRegistration,
          })
        : undefined,
    },
    metadata: toMetadata(unsignedTx.metadata),
    unsignedTx,
  }

  return yoroiTx
}

export const toAmounts = (values: Array<CardanoTypes.TokenEntry>) =>
  values.reduce(
    (result, current) => ({
      ...result,
      [current.identifier]: Quantities.sum([
        Amounts.getAmount(result, current.identifier).quantity || '0',
        current.amount.toString() as Balance.Quantity,
      ]),
    }),
    {} as Balance.Amounts,
  )

export const toMetadata = (metadata: ReadonlyArray<CardanoTypes.TxMetadata>) =>
  metadata.reduce(
    (result, current) => ({
      ...result,
      [current.label]: current.data,
    }),
    {} as YoroiMetadata,
  )

export const toEntriesFromChange = (change: ReadonlyArray<Change>): Promise<YoroiEntry[]> => {
  return Promise.all(
    change.map(async (o) => ({
      address: await toDisplayAddress(o.address),
      amounts: toAmounts(o.values.values),
    })),
  )
}

export const toEntriesFromOutputs = (
  outputs: ReadonlyArray<{
    address: string
    value: MultiTokenValue
    datum?: Datum
  }>,
): Promise<YoroiEntry[]> => {
  return Promise.all(
    outputs.map(async (o) => ({
      address: await toDisplayAddress(o.address),
      amounts: toAmounts(o.value.values),
      datum: o.datum,
    })),
  )
}

const Staking = {
  toWithdrawals: async (withdrawals: CardanoTypes.UnsignedTx['withdrawals']): Promise<YoroiEntry[]> => {
    if (!withdrawals.hasValue()) return [] // no withdrawals

    const result: YoroiEntry[] = []
    const length = await withdrawals.len()
    const rewardAddresses = await withdrawals.keys()

    for (let i = 0; i < length; i++) {
      const rewardAddress = await rewardAddresses.get(i)
      const amount = (await withdrawals.get(rewardAddress).then((x) => x.toStr())) as Balance.Quantity
      const address = await rewardAddress
        .toAddress()
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      result.push({
        address,
        amounts: {'': amount},
      })
    }

    return result
  },

  toDeregistrations: ({
    deregistrations,
    networkConfig: {CHAIN_NETWORK_ID, KEY_DEPOSIT},
  }: {
    deregistrations: CardanoTypes.UnsignedTx['deregistrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }): Promise<YoroiEntry[]> =>
    Promise.all(
      deregistrations.map(async (deregistration) => {
        const address = await deregistration
          .stakeCredential()
          .then((stakeCredential) =>
            CardanoMobile.RewardAddress.new(
              Number(CHAIN_NETWORK_ID) /* API NETWORK_ID is equivalent to CHAIN_NETWORK_ID here */,
              stakeCredential,
            ),
          )
          .then((rewardAddress) => rewardAddress.toAddress())
          .then((address) => address.toBytes())
          .then((bytes) => Buffer.from(bytes).toString('hex'))
        return {address, amounts: {'': KEY_DEPOSIT as Balance.Quantity}}
      }),
    ),

  toRegistrations: async ({
    registrations,
    networkConfig: {CHAIN_NETWORK_ID, KEY_DEPOSIT},
  }: {
    registrations: CardanoTypes.UnsignedTx['registrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }): Promise<YoroiEntry[]> => {
    return Promise.all(
      registrations.map(async (registration) => {
        const address: string = await registration
          .stakeCredential()
          .then((stakeCredential) =>
            CardanoMobile.RewardAddress.new(
              Number(CHAIN_NETWORK_ID) /* API NETWORK_ID is equivalent to CHAIN_NETWORK_ID here */,
              stakeCredential,
            ),
          )
          .then((rewardAddress) => rewardAddress.toAddress())
          .then((address) => address.toBytes())
          .then((bytes) => Buffer.from(bytes).toString('hex'))

        return {address, amounts: {'': KEY_DEPOSIT as Balance.Quantity}}
      }),
    )
  },

  toDelegations: ({
    balances,
    fee,
  }: {
    balances: CardanoTypes.StakingKeyBalances
    fee: YoroiUnsignedTx['fee']
  }): YoroiEntry[] =>
    Object.entries(balances).map(([poolId, quantity]) => ({
      address: poolId,
      amounts: Amounts.diff({'': quantity} as Balance.Amounts, fee),
    })),
}

type VotingRegistration = {
  votingPublicKey: string
  stakingPublicKey: string
  rewardAddress: string
  nonce: number
}
const Voting = {
  toRegistration: ({votingRegistration}: {votingRegistration?: VotingRegistration}): YoroiVoting['registration'] =>
    votingRegistration,
}

export const toDisplayAddress = async (address: string) => {
  if (await CardanoMobile.ByronAddress.isValid(address) /* base58 */) {
    return address
  }

  if (
    isBaseAddressHex(address) ||
    isRewardAddressHex(address) ||
    isEnterpriseAddressHex(address) ||
    isPointerAddressHex(address)
  ) {
    return CardanoMobile.Address.fromBytes(Buffer.from(address, 'hex')).then((address) => address.toBech32())
  }

  if (isByronAddressHex(address)) {
    return CardanoMobile.Address.fromBytes(Buffer.from(address, 'hex'))
      .then((address) => CardanoMobile.ByronAddress.fromAddress(address))
      .then((address) => address.toBase58())
  }

  return address
}

const isBaseAddressHex = (address: string) => ['0', '1', '2', '3'].includes(address.charAt(0))
const isPointerAddressHex = (address: string) => ['4', '5'].includes(address.charAt(0))
const isEnterpriseAddressHex = (address: string) => ['6', '7'].includes(address.charAt(0))
const isByronAddressHex = (address: string) => ['8'].includes(address.charAt(0))
const isRewardAddressHex = (address: string) => ['e', 'E', 'f', 'F'].includes(address.charAt(0))
