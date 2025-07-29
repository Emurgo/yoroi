import {
  Change,
  Datum,
  MultiTokenValue,
} from '@emurgo/yoroi-lib/dist/internals/models'
import {Balance, Network} from '@yoroi/types'

import {
  YoroiEntry,
  YoroiMetadata,
  YoroiUnsignedTx,
  YoroiVoting,
} from '~/wallets/types/yoroi'
import {Amounts, asQuantity, Entries, Quantities} from '~/wallets/utils/utils'
import {Cardano, CardanoMobile} from '~/wallets/wallets'
import {CardanoTypes} from '../types'

export const yoroiUnsignedTx = ({
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
  const change = toEntriesFromChange(unsignedTx.change)
  const outputsEntries = toEntriesFromOutputs(unsignedTx.outputs)
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  entries = entries ?? Entries.remove(outputsEntries, changeAddresses)
  const stakingBalances =
    Cardano.getBalanceForStakingCredentials(addressedUtxos)

  const yoroiTx: YoroiUnsignedTx = {
    entries,
    fee,
    change,
    staking: {
      withdrawals:
        unsignedTx.withdrawals?.hasValue() && unsignedTx.withdrawals.len() > 0
          ? Staking.toWithdrawals(unsignedTx.withdrawals, primaryTokenId)
          : undefined,
      registrations:
        unsignedTx.registrations.length > 0
          ? Staking.toRegistrations({
              registrations: unsignedTx.registrations,
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      deregistrations:
        unsignedTx.deregistrations.length > 0
          ? Staking.toDeregistrations({
              deregistrations: unsignedTx.deregistrations,
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      delegations:
        unsignedTx.delegations.length > 0
          ? Staking.toDelegations({
              balances: stakingBalances,
              fee,
              primaryTokenId,
            })
          : undefined,
    },
    voting: {
      registration: votingRegistration
        ? Voting.toRegistration({votingRegistration})
        : undefined,
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

const toEntriesFromChange = (changes: ReadonlyArray<Change>): YoroiEntry[] => {
  return changes.map((change) => ({
    address: toDisplayAddress(change.address),
    amounts: toAmounts(change.values.values),
  }))
}

export const toEntriesFromOutputs = (
  outputs: ReadonlyArray<{
    address: string
    value: MultiTokenValue
    datum?: Datum
  }>,
): YoroiEntry[] => {
  return outputs.map((output) => ({
    address: toDisplayAddress(output.address),
    amounts: toAmounts(output.value.values),
    datum: output.datum,
  }))
}

const Staking = {
  toWithdrawals: (
    withdrawals: CardanoTypes.UnsignedTx['withdrawals'],
    primaryTokenId: string,
  ): YoroiEntry[] => {
    if (!withdrawals?.hasValue()) return [] // no withdrawals

    const result: YoroiEntry[] = []
    const length = withdrawals.len()
    const rewardAddresses = withdrawals.keys()

    for (let i = 0; i < length; i++) {
      const rewardAddress = rewardAddresses.get(i)
      const amount = (withdrawals.get(rewardAddress)?.toStr() ??
        Quantities.zero) as Balance.Quantity
      const address = Buffer.from(rewardAddress.toAddress().toBytes()).toString(
        'hex',
      )

      result.push({
        address,
        amounts: {[primaryTokenId]: amount},
      })
    }

    return result
  },

  toDeregistrations: ({
    deregistrations,
    networkManager,
    primaryTokenId,
    keyDeposit,
  }: {
    deregistrations: CardanoTypes.UnsignedTx['deregistrations']
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): YoroiEntry[] =>
    deregistrations.map((deregistration) => {
      const address = Buffer.from(
        CardanoMobile.RewardAddress.new(
          networkManager.chainId,
          deregistration.stakeCredential(),
        )
          .toAddress()
          .toBytes(),
      ).toString('hex')
      return {address, amounts: {[primaryTokenId]: asQuantity(keyDeposit)}}
    }),

  toRegistrations: ({
    registrations,
    networkManager,
    primaryTokenId,
    keyDeposit,
  }: {
    registrations: CardanoTypes.UnsignedTx['registrations']
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): YoroiEntry[] => {
    return registrations.map((registration) => {
      const address: string = Buffer.from(
        CardanoMobile.RewardAddress.new(
          networkManager.chainId,
          registration.stakeCredential(),
        )
          .toAddress()
          .toBytes(),
      ).toString('hex')

      return {address, amounts: {[primaryTokenId]: asQuantity(keyDeposit)}}
    })
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
  toRegistration: ({
    votingRegistration,
  }: {
    votingRegistration?: VotingRegistration
  }): YoroiVoting['registration'] => votingRegistration,
}

export const toDisplayAddress = (address: string) => {
  if (CardanoMobile.ByronAddress.isValid(address) /* base58 */) {
    return address
  }

  if (
    isBaseAddressHex(address) ||
    isRewardAddressHex(address) ||
    isEnterpriseAddressHex(address) ||
    isPointerAddressHex(address)
  ) {
    const wasmAddress = CardanoMobile.Address.fromBytes(
      Buffer.from(address, 'hex'),
    )
    if (!wasmAddress) throw new Error('Invalid address')
    return wasmAddress.toBech32(undefined)
  }

  if (isByronAddressHex(address)) {
    const wasmAddress = CardanoMobile.ByronAddress.fromAddress(
      CardanoMobile.Address.fromBytes(Buffer.from(address, 'hex')),
    )
    if (!wasmAddress) throw new Error('Invalid Byron address')
    return wasmAddress.toBase58()
  }

  return address
}

const isBaseAddressHex = (address: string) =>
  ['0', '1', '2', '3'].includes(address.charAt(0))
const isPointerAddressHex = (address: string) =>
  ['4', '5'].includes(address.charAt(0))
const isEnterpriseAddressHex = (address: string) =>
  ['6', '7'].includes(address.charAt(0))
const isByronAddressHex = (address: string) => ['8'].includes(address.charAt(0))
const isRewardAddressHex = (address: string) =>
  ['e', 'E', 'f', 'F'].includes(address.charAt(0))
