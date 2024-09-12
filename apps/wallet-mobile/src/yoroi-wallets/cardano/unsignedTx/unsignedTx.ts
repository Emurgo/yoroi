import {Change, Datum, MultiTokenValue} from '@emurgo/yoroi-lib/dist/internals/models'
import {Balance, Network} from '@yoroi/types'

import {YoroiEntry, YoroiMetadata, YoroiUnsignedTx, YoroiVoting} from '../../types'
import {Amounts, asQuantity, Entries, Quantities} from '../../utils'
import {Cardano, CardanoMobile} from '../../wallets'
import {CardanoTypes} from '../types'

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkManager,
  votingRegistration,
  addressedUtxos,
  entries,
  primaryTokenId,
  governance,
  keyDeposit,
}: {
  unsignedTx: CardanoTypes.UnsignedTx
  networkManager: Network.Manager
  votingRegistration?: VotingRegistration
  addressedUtxos: CardanoTypes.CardanoAddressedUtxo[]
  entries?: YoroiEntry[]
  primaryTokenId: string
  governance?: boolean
  keyDeposit: string
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
        unsignedTx.withdrawals?.hasValue() && (await unsignedTx.withdrawals.len()) > 0
          ? await Staking.toWithdrawals(unsignedTx.withdrawals, primaryTokenId)
          : undefined,
      registrations:
        unsignedTx.registrations.length > 0
          ? await Staking.toRegistrations({
              registrations: unsignedTx.registrations,
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      deregistrations:
        unsignedTx.deregistrations.length > 0
          ? await Staking.toDeregistrations({
              deregistrations: unsignedTx.deregistrations,
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      delegations:
        unsignedTx.delegations.length > 0
          ? Staking.toDelegations({balances: stakingBalances, fee, primaryTokenId})
          : undefined,
    },
    voting: {
      registration: votingRegistration ? Voting.toRegistration({votingRegistration}) : undefined,
    },
    metadata: toMetadata(unsignedTx.metadata),
    unsignedTx,
    governance: governance ?? false,
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

export const toEntriesFromChange = (changes: ReadonlyArray<Change>): Promise<YoroiEntry[]> => {
  return Promise.all(
    changes.map(async (change) => ({
      address: await toDisplayAddress(change.address),
      amounts: toAmounts(change.values.values),
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
    outputs.map(async (output) => ({
      address: await toDisplayAddress(output.address),
      amounts: toAmounts(output.value.values),
      datum: output.datum,
    })),
  )
}

const Staking = {
  toWithdrawals: async (
    withdrawals: CardanoTypes.UnsignedTx['withdrawals'],
    primaryTokenId: string,
  ): Promise<YoroiEntry[]> => {
    if (!withdrawals?.hasValue()) return [] // no withdrawals

    const result: YoroiEntry[] = []
    const length = await withdrawals.len()
    const rewardAddresses = await withdrawals.keys()

    for (let i = 0; i < length; i++) {
      const rewardAddress = await rewardAddresses.get(i)
      const amount = (await withdrawals
        .get(rewardAddress)
        .then((x) => x?.toStr() ?? Quantities.zero)) as Balance.Quantity
      const address = await rewardAddress
        .toAddress()
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      result.push({
        address,
        amounts: {[primaryTokenId]: amount},
      })
    }

    return result
  },

  toDeregistrations: async ({
    deregistrations,
    networkManager,
    primaryTokenId,
    keyDeposit,
  }: {
    deregistrations: CardanoTypes.UnsignedTx['deregistrations']
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): Promise<YoroiEntry[]> =>
    Promise.all(
      deregistrations.map(async (deregistration) => {
        const address = await deregistration
          .stakeCredential()
          .then((stakeCredential) => CardanoMobile.RewardAddress.new(networkManager.chainId, stakeCredential))
          .then((rewardAddress) => rewardAddress.toAddress())
          .then((address) => address.toBytes())
          .then((bytes) => Buffer.from(bytes).toString('hex'))
        return {address, amounts: {[primaryTokenId]: asQuantity(keyDeposit)}}
      }),
    ),

  toRegistrations: async ({
    registrations,
    networkManager,
    primaryTokenId,
    keyDeposit,
  }: {
    registrations: CardanoTypes.UnsignedTx['registrations']
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): Promise<YoroiEntry[]> => {
    return Promise.all(
      registrations.map(async (registration) => {
        const address: string = await registration
          .stakeCredential()
          .then((stakeCredential) => CardanoMobile.RewardAddress.new(networkManager.chainId, stakeCredential))
          .then((rewardAddress) => rewardAddress.toAddress())
          .then((address) => address.toBytes())
          .then((bytes) => Buffer.from(bytes).toString('hex'))

        return {address, amounts: {[primaryTokenId]: asQuantity(keyDeposit)}}
      }),
    )
  },

  toDelegations: ({
    balances,
    fee,
    primaryTokenId,
  }: {
    balances: CardanoTypes.StakingKeyBalances
    fee: YoroiUnsignedTx['fee']
    primaryTokenId: string
  }): YoroiEntry[] =>
    Object.entries(balances).map(([poolId, quantity]) => ({
      address: poolId,
      amounts: Amounts.diff({[primaryTokenId]: asQuantity(quantity)}, fee),
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
    return CardanoMobile.Address.fromBytes(Buffer.from(address, 'hex')).then((address) => {
      if (!address) throw new Error('Invalid address')
      return address.toBech32(undefined)
    })
  }

  if (isByronAddressHex(address)) {
    return CardanoMobile.Address.fromBytes(Buffer.from(address, 'hex'))
      .then((address) => CardanoMobile.ByronAddress.fromAddress(address))
      .then((address) => {
        if (!address) throw new Error('Invalid Byron address')
        return address.toBase58()
      })
  }

  return address
}

const isBaseAddressHex = (address: string) => ['0', '1', '2', '3'].includes(address.charAt(0))
const isPointerAddressHex = (address: string) => ['4', '5'].includes(address.charAt(0))
const isEnterpriseAddressHex = (address: string) => ['6', '7'].includes(address.charAt(0))
const isByronAddressHex = (address: string) => ['8'].includes(address.charAt(0))
const isRewardAddressHex = (address: string) => ['e', 'E', 'f', 'F'].includes(address.charAt(0))
