import {Portfolio} from '@yoroi/types'

import {YoroiEntries, YoroiMetadata, YoroiUnsignedTx, YoroiVoting} from '../../types'
import {Amounts, Entries, Quantities} from '../../utils'
import {Cardano, CardanoMobile} from '../../wallets'
import {CardanoHaskellShelleyNetwork} from '../networks'
import {CardanoTypes} from '../types'

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkConfig,
  votingRegistration,
  addressedUtxos,
}: {
  unsignedTx: CardanoTypes.UnsignedTx
  networkConfig: CardanoHaskellShelleyNetwork
  votingRegistration?: VotingRegistration
  addressedUtxos: CardanoTypes.CardanoAddressedUtxo[]
}) => {
  const fee = toAmounts(unsignedTx.fee.values)
  const change = toEntries(
    await Promise.all(
      unsignedTx.change.map((change) =>
        toDisplayAddress(change.address).then((address) => ({...change, address, value: change.values})),
      ),
    ),
  )
  const outputsEntries = toEntries(
    await Promise.all(
      unsignedTx.outputs.map((output) => toDisplayAddress(output.address).then((address) => ({...output, address}))),
    ),
  )
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  const entries = Entries.remove(outputsEntries, changeAddresses)
  const amounts = Entries.toAmounts(entries)
  const stakingBalances = await Cardano.getBalanceForStakingCredentials(addressedUtxos)

  const yoroiTx: YoroiUnsignedTx = {
    amounts,
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

type AddressedValue = {
  address: string
  value: CardanoTypes.MultiTokenValue
}

export const toAmounts = (values: Array<CardanoTypes.TokenEntry>) =>
  values.reduce(
    (result, current) => ({
      ...result,
      [current.identifier]: Quantities.sum([
        Amounts.getAmount(result, current.identifier).quantity || '0',
        current.amount.toString() as Portfolio.Quantity,
      ]),
    }),
    {} as Portfolio.Amounts,
  )

export const toMetadata = (metadata: ReadonlyArray<CardanoTypes.TxMetadata>) =>
  metadata.reduce(
    (result, current) => ({
      ...result,
      [current.label]: current.data,
    }),
    {} as YoroiMetadata,
  )

export const toEntries = (addressedValues: ReadonlyArray<AddressedValue>) =>
  addressedValues.reduce(
    (result, current) => ({
      ...result,
      [current.address]: toAmounts(current.value.values),
    }),
    {} as YoroiEntries,
  )

const Staking = {
  toWithdrawals: async (withdrawals: CardanoTypes.UnsignedTx['withdrawals']) => {
    if (!withdrawals.hasValue()) return {} // no withdrawals

    const result: YoroiEntries = {}
    const length = await withdrawals.len()
    const rewardAddresses = await withdrawals.keys()

    for (let i = 0; i < length; i++) {
      const rewardAddress = await rewardAddresses.get(i)
      const amount = (await withdrawals.get(rewardAddress).then((x) => x.toStr())) as Portfolio.Quantity
      const address = await rewardAddress
        .toAddress()
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      result[address] = {'': amount}
    }

    return result
  },

  toDeregistrations: ({
    deregistrations,
    networkConfig: {CHAIN_NETWORK_ID, KEY_DEPOSIT},
  }: {
    deregistrations: CardanoTypes.UnsignedTx['deregistrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    deregistrations.reduce(async (result, current) => {
      const address = await current
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

      return {
        ...(await result),
        [address]: {'': KEY_DEPOSIT as Portfolio.Quantity},
      }
    }, Promise.resolve({} as YoroiEntries)),

  toRegistrations: ({
    registrations,
    networkConfig: {CHAIN_NETWORK_ID, KEY_DEPOSIT},
  }: {
    registrations: CardanoTypes.UnsignedTx['registrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    registrations.reduce(async (result, current) => {
      const address = await current
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

      return {
        ...(await result),
        [address]: {'': KEY_DEPOSIT as Portfolio.Quantity},
      }
    }, Promise.resolve({} as YoroiEntries)),

  toDelegations: ({
    balances,
    fee,
  }: {
    balances: CardanoTypes.StakingKeyBalances
    fee: YoroiUnsignedTx['fee']
  }): {[poolId: string]: Portfolio.Amounts} =>
    Object.entries(balances).reduce(
      (result, [poolId, quantity]) => ({
        ...result,
        [poolId]: Amounts.diff({'': quantity} as Portfolio.Amounts, fee),
      }),
      {},
    ),
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
