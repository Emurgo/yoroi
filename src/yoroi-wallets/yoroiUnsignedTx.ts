import {MultiTokenValue, TxMetadata, UnsignedTx} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'

import {CardanoHaskellShelleyNetwork} from '../legacy/networks'
import {TokenEntry} from '../types'
import {RewardAddress} from './cardano'
import {
  Quantity,
  TokenId,
  YoroiAmount,
  YoroiAmounts,
  YoroiEntries,
  YoroiEntry,
  YoroiMetadata,
  YoroiUnsignedTx,
} from './types'

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
      delegations: await Staking.toDelegations({delegations: unsignedTx.delegations, networkConfig}),
    },
    voting: {
      registrations: await Voting.toRegistrations({
        metadata: unsignedTx.metadata,
        networkConfig,
      }),
    },
    metadata: toMetadata(unsignedTx.metadata),

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

export const Entries = {
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
  remove: (entries: YoroiEntries, removeAddresses: Array<string>): YoroiEntries => {
    const _entries = Object.entries(entries)
    const filteredEntries = _entries.filter(([address]) => !removeAddresses.includes(address))

    return Object.fromEntries(filteredEntries)
  },
  toAddresses: (entries: YoroiEntries): Array<string> => {
    return Object.keys(entries)
  },
  toAmounts: (entries: YoroiEntries): YoroiAmounts => {
    const amounts = Object.values(entries)

    return Amounts.sum(amounts)
  },
}

export const Amounts = {
  sum: (amounts: Array<YoroiAmounts>): YoroiAmounts => {
    const entries = amounts.map((amounts) => Object.entries(amounts)).flat()

    return entries.reduce(
      (result, [tokenId, quantity]) => ({
        ...result,
        [tokenId]: result[tokenId] ? Quantities.sum([result[tokenId], quantity]) : quantity,
      }),
      {} as YoroiAmounts,
    )
  },
  diff: (amounts1: YoroiAmounts, amounts2: YoroiAmounts): YoroiAmounts => {
    return Amounts.sum([amounts1, Amounts.negated(amounts2)])
  },
  negated: (amounts: YoroiAmounts): YoroiAmounts => {
    const entries = Object.entries(amounts)
    const negatedEntries = entries.map(([tokenId, amount]) => [tokenId, Quantities.negated(amount)])

    return Object.fromEntries(negatedEntries)
  },
  remove: (amounts: YoroiAmounts, removeTokenIds: Array<TokenId>): YoroiAmounts => {
    const filteredEntries = Object.entries(amounts).filter(([tokenId]) => !removeTokenIds.includes(tokenId))

    return Object.fromEntries(filteredEntries)
  },
  getAmount: (amounts: YoroiAmounts, tokenId: string): YoroiAmount => {
    return {
      tokenId,
      quantity: amounts[tokenId] || '0',
    }
  },
}

export const Quantities = {
  sum: (quantities: Array<Quantity>) => {
    return quantities.reduce((result, current) => result.plus(current), new BigNumber(0)).toString() as Quantity
  },
  diff: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString() as Quantity
  },
  negated: (quantity: Quantity) => {
    return new BigNumber(quantity).negated().toString() as Quantity
  },
}
