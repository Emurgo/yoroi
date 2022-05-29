import {MultiTokenValue, TxMetadata, UnsignedTx} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'

import {CardanoHaskellShelleyNetwork} from '../legacy/networks'
import {TokenEntry} from '../types'
import {RewardAddress} from './cardano'
import {Quantity, YoroiAmount, YoroiAmounts, YoroiAuxiliary, YoroiEntries, YoroiEntry, YoroiUnsignedTx} from './types'

const PRIMARY_TOKEN_ID = ''

export const yoroiUnsignedTx = async ({
  unsignedTx,
  networkConfig,
  other,
}: {
  unsignedTx: UnsignedTx
  networkConfig: CardanoHaskellShelleyNetwork
  other?: Record<string, unknown>
}) => {
  const fee = toAmounts(unsignedTx.fee.values)
  const change = toEntries(
    unsignedTx.change.map((change) => ({
      address: change.address,
      value: change.values,
    })),
  )
  const entries = (() => {
    // entries === (outputs - change)
    const outputs = toEntries(unsignedTx.outputs)
    Object.keys(change).forEach((address) => delete outputs[address])

    return outputs
  })()

  const amounts = Object.values(entries).reduce((result, current) => Amounts.sum([result, current]), {} as YoroiAmounts)

  const yoroiTx: YoroiUnsignedTx = {
    amounts,
    entries,
    fee,
    change,
    staking: {
      withdrawals: await Staking.toWithdrawals(unsignedTx.withdrawals),
      registrations: await Staking.toRegistrations({registrations: unsignedTx.registrations, networkConfig}),
      deregistrations: await Staking.toDeregistrations({deregistrations: unsignedTx.deregistrations, networkConfig}),
      delegations: await Staking.toDelegations({delegations: unsignedTx.delegations, networkConfig}),
    },
    voting: {
      registrations: await Voting.toRegistrations({
        metadata: unsignedTx.metadata,
        networkConfig,
      }),
    },
    auxiliary: toAuxiliary(unsignedTx.metadata),

    unsignedTx,
    other,
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
      [current.identifier]: Quantities.sum([result[current.identifier] || '0', current.amount.toString() as Quantity]),
    }),
    {} as YoroiAmounts,
  )

export const toAuxiliary = (metadata: ReadonlyArray<TxMetadata>) =>
  metadata.reduce(
    (result, current) => ({
      ...result,
      [current.label]: current.data,
    }),
    {} as YoroiAuxiliary,
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
    networkConfig: {NETWORK_ID, KEY_DEPOSIT},
  }: {
    delegations: UnsignedTx['delegations']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    delegations.reduce(async (result, current) => {
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
}

const registrationLabel = '61284'

const Voting = {
  toRegistrations: async ({
    metadata,
    networkConfig: {NETWORK_ID},
  }: {
    metadata: UnsignedTx['metadata']
    networkConfig: CardanoHaskellShelleyNetwork
  }) =>
    metadata //
      .filter((metadatum) => metadatum.label === registrationLabel)
      .reduce(async (result, current) => {
        const address = await RewardAddress.new(NETWORK_ID, current.data[2])
          .then((rewardAddress) => rewardAddress.toAddress())
          .then((address) => address.toBytes())
          .then((bytes) => Buffer.from(bytes).toString('hex'))

        return {
          ...(await result),
          [address]: {}, // staked amounts unknown
        }
      }, Promise.resolve({} as YoroiEntries)),
}

export const Quantities = {
  sum: (quantities: Array<Quantity>) =>
    quantities.reduce((result, current) => result.plus(current), new BigNumber(0)).toString() as Quantity,
  diff: (quantity1: Quantity, quantity2: Quantity) =>
    new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString() as Quantity,
  negated: (quantity: Quantity) => new BigNumber(quantity).negated().toString() as Quantity,
}

export const Amounts = {
  sum: (amounts: Array<YoroiAmounts>) =>
    amounts
      .map((amounts) => Object.entries(amounts))
      .flat()
      .reduce(
        (result, [tokenId, quantity]) => ({
          ...result,
          [tokenId]: Quantities.sum([result[tokenId] || '0', quantity]),
        }),
        {} as YoroiAmounts,
      ),

  diff: (amounts1: YoroiAmounts, amounts2: YoroiAmounts) => Amounts.sum([amounts1, Amounts.negated(amounts2)]),
  negated: (amounts: YoroiAmounts) =>
    Object.fromEntries(Object.entries(amounts).map(([tokenId, amount]) => [tokenId, Quantities.negated(amount)])),
  getAmount: (amounts: YoroiAmounts, tokenId: string): YoroiAmount => ({
    tokenId,
    quantity: amounts[tokenId] || '0',
  }),
}

export const Entries = {
  getPrimaryAmount: (entries: YoroiEntries): YoroiAmount => Entries.getAmount(Entries.first(entries), PRIMARY_TOKEN_ID),
  getSecondaryAmounts: (entries: YoroiEntries): YoroiAmounts => {
    const amounts = Entries.first(entries).amounts
    const secondaryAmountsTuples = Object.entries(amounts).filter(([tokenId]) => tokenId !== PRIMARY_TOKEN_ID)

    return Object.fromEntries(secondaryAmountsTuples)
  },
  first: (entries: YoroiEntries): YoroiEntry => {
    const addresses = Object.keys(entries)
    if (addresses.length > 1) throw new Error('multiple addresses not supported')
    const firstEntry = Object.entries(entries)[0]
    if (!firstEntry) throw new Error('invalid entries')

    return {
      address: firstEntry[0],
      amounts: firstEntry[1],
    }
  },
  getAmount: (entry: YoroiEntry, tokenId: string): YoroiAmount => Amounts.getAmount(entry.amounts, tokenId),
  toAmounts: (entries: YoroiEntries): YoroiAmounts => Amounts.sum(Object.values(entries)),
}
