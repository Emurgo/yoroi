import {MultiTokenValue, StakingKeyBalances, TokenEntry, TxMetadata, UnsignedTx} from '@emurgo/yoroi-lib-core'

import {CardanoHaskellShelleyNetwork} from '../../legacy/networks'
import {Quantity, YoroiAmounts, YoroiEntries, YoroiMetadata, YoroiUnsignedTx, YoroiVoting} from '../types'
import {Amounts, Entries, Quantities} from '../utils'
import {cardano, RewardAddress} from '.'

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkConfig,
  votingRegistration,
}: {
  unsignedTx: UnsignedTx
  networkConfig: CardanoHaskellShelleyNetwork
  votingRegistration?: VotingRegistration
}) => {
  const fee = toAmounts(unsignedTx.fee.values)
  const change = toEntries(unsignedTx.change.map((change) => ({address: change.address, value: change.values})))
  const outputEntries = toEntries(unsignedTx.outputs)
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  const entries = Entries.remove(outputEntries, changeAddresses)
  const amounts = Entries.toAmounts(entries)
  const stakingBalances = await cardano.getBalanceForStakingCredentials([...unsignedTx.senderUtxos])

  const yoroiTx: YoroiUnsignedTx = {
    amounts,
    entries,
    fee,
    change,
    staking: {
      withdrawals:
        (unsignedTx.withdrawals.hasValue() && (await unsignedTx.withdrawals.len())) > 0
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
          ? await Staking.toDelegations({
              delegations: unsignedTx.delegations,
              balances: stakingBalances,
            })
          : undefined,
    },
    voting: {
      registration: await Voting.toRegistration({
        votingRegistration,
      }),
    },
    metadata: toMetadata(unsignedTx.metadata),
    unsignedTx,
  }

  return yoroiTx
}

type AddressedValue = {
  address: string
  value: MultiTokenValue
}

export const toAmounts = (values: Array<TokenEntry>) =>
  values.reduce(
    (result, current) => ({
      ...result,
      [current.identifier]: Quantities.sum([
        Amounts.getAmount(result, current.identifier).quantity || '0',
        current.amount.toString() as Quantity,
      ]),
    }),
    {} as YoroiAmounts,
  )

export const toMetadata = (metadata: ReadonlyArray<TxMetadata>) =>
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
  toWithdrawals: async (withdrawals: UnsignedTx['withdrawals']) => {
    if (!withdrawals.hasValue()) return {} // no withdrawals

    const result: YoroiEntries = {}
    const length = await withdrawals.len()
    const rewardAddresses = await withdrawals.keys()

    for (let i = 0; i < length; i++) {
      const rewardAddress = await rewardAddresses.get(i)
      const amount = (await withdrawals.get(rewardAddress).then((x) => x.toStr())) as Quantity
      const address = await rewardAddress
        .toAddress()
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      result[address] = {'': amount}
    }

    return result
  },

  toDeregistrations: async ({
    deregistrations,
    networkConfig: {NETWORK_ID, KEY_DEPOSIT},
  }: {
    deregistrations: UnsignedTx['deregistrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    deregistrations.reduce(async (result, current) => {
      const address = await current
        .stakeCredential()
        .then((stakeCredential) => RewardAddress.new(NETWORK_ID, stakeCredential))
        .then((rewardAddress) => rewardAddress.toAddress())
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      return {
        ...(await result),
        [address]: {'': KEY_DEPOSIT as Quantity},
      }
    }, Promise.resolve({} as YoroiEntries)),

  toRegistrations: async ({
    registrations,
    networkConfig: {NETWORK_ID, KEY_DEPOSIT},
  }: {
    registrations: UnsignedTx['registrations']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    registrations.reduce(async (result, current) => {
      const address = await current
        .stakeCredential()
        .then((stakeCredential) => RewardAddress.new(NETWORK_ID, stakeCredential))
        .then((rewardAddress) => rewardAddress.toAddress())
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      return {
        ...(await result),
        [address]: {'': KEY_DEPOSIT as Quantity},
      }
    }, Promise.resolve({} as YoroiEntries)),

  toDelegations: async ({
    delegations,
    balances,
  }: {
    delegations: UnsignedTx['delegations']
    balances: StakingKeyBalances
  }): Promise<{[poolId: string]: YoroiAmounts}> => {
    if (delegations.length <= 0) return {}

    return Object.entries(balances).reduce(
      (result, [poolId, quantity]) => ({
        ...result,
        [poolId]: {'': quantity},
      }),
      {},
    )
  },
}

type VotingRegistration = {
  votingPublicKey: string
  stakingPublicKey: string
  rewardAddress: string
  nonce: number
}
const Voting = {
  toRegistration: async ({
    votingRegistration,
  }: {
    votingRegistration?: VotingRegistration
  }): Promise<YoroiVoting['registration']> => votingRegistration,
}
