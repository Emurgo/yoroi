import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {MultiTokenValue, StakingKeyBalances, TokenEntry, TxMetadata, UnsignedTx} from '@emurgo/yoroi-lib-core'

import {CardanoHaskellShelleyNetwork} from '../../legacy/networks'
import {Quantity, YoroiAmounts, YoroiEntries, YoroiMetadata, YoroiUnsignedTx} from '../types'
import {Amounts, Entries, Quantities} from '../utils'
import {cardano, RewardAddress} from '.'

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkConfig,
  ledgerPayload,
  ledgerNanoCatalystRegistrationTxSignData,
}: {
  unsignedTx: UnsignedTx
  networkConfig: CardanoHaskellShelleyNetwork
  ledgerPayload?: SignTransactionRequest
  ledgerNanoCatalystRegistrationTxSignData?: {
    votingPublicKey: string
    stakingKeyPath: Array<number>
    stakingKey: string
    rewardAddress: string
    nonce: number
  }
}) => {
  const fee = toAmounts(unsignedTx.fee.values)
  const change = toEntries(unsignedTx.change.map((change) => ({address: change.address, value: change.values})))
  const outputEntries = toEntries(unsignedTx.outputs)
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  const entries = Entries.remove(outputEntries, changeAddresses)
  const amounts = Entries.toAmounts(entries)

  const yoroiTx: YoroiUnsignedTx = {
    amounts,
    entries,
    fee,
    change,
    staking: {
      withdrawals: await Staking.toWithdrawals(unsignedTx.withdrawals),
      registrations: await Staking.toRegistrations({registrations: unsignedTx.registrations, networkConfig}),
      deregistrations: await Staking.toDeregistrations({deregistrations: unsignedTx.deregistrations, networkConfig}),
      delegations: await Staking.toDelegations({
        balances: await cardano.getBalanceForStakingCredentials([...unsignedTx.senderUtxos]),
      }),
    },
    voting: {
      registrations: await Voting.toRegistrations({
        metadata: unsignedTx.metadata,
        networkConfig: networkConfig,
      }),
    },
    metadata: toMetadata(unsignedTx.metadata),
    unsignedTx,
    hw: {
      ledgerNanoCatalystRegistrationTxSignData,
      ledgerPayload,
    },
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

  toDelegations: async ({balances}: {balances: StakingKeyBalances}): Promise<{[poolId: string]: YoroiAmounts}> =>
    Object.entries(balances).reduce(
      (result, [poolId, quantity]) => ({
        ...result,
        [poolId]: {'': quantity},
      }),
      {},
    ),
}

const REGISTRATION_LABEL = '61284'

const Voting = {
  toRegistrations: async ({
    metadata,
    networkConfig: {NETWORK_ID},
  }: {
    metadata: UnsignedTx['metadata']
    networkConfig: CardanoHaskellShelleyNetwork
  }) => {
    const votingMetadata = metadata.filter((metadatum) => metadatum.label === REGISTRATION_LABEL)

    return votingMetadata.reduce(async (result, current) => {
      const address = await RewardAddress.new(NETWORK_ID, current.data[2])
        .then((rewardAddress) => rewardAddress.toAddress())
        .then((address) => address.toBytes())
        .then((bytes) => Buffer.from(bytes).toString('hex'))

      return {
        ...(await result),
        [address]: {}, // staked amounts unknown
      }
    }, Promise.resolve({} as YoroiEntries))
  },
}
