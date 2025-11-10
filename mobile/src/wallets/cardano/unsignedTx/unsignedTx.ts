import {
  Datum,
  MultiTokenValue,
  TransactionOutput,
  getBalanceForStakingCredentials,
} from '@yoroi/tx'
import {Balance, Network} from '@yoroi/types'

import {
  YoroiMetadata,
  YoroiUnsignedTx,
  YoroiVoting,
} from '~/wallets/types/yoroi'
import {Amounts, Entries, Quantities, asQuantity} from '~/wallets/utils/utils'
import {CardanoMobile} from '~/wallets/wallets'

import {CardanoTypes} from '../types'

/**
 * @deprecated This function is no longer used in production code.
 * It's kept for backward compatibility with mocks/tests.
 * The function expects a legacy UnsignedTx format that doesn't match TransactionBody.
 * If you need to convert UnsignedTransaction to YoroiUnsignedTx, use the adapter in packages/tx/utils/unsigned-tx-adapter.ts
 */
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
  entries?: TransactionOutput[]
  primaryTokenId: string
  governance?: boolean
  keyDeposit: string
}): Promise<YoroiUnsignedTx> => {
  // This function expects a legacy format that doesn't match TransactionBody
  // Since it's not used in production, we'll use type assertions to make it compile
  // In practice, this should never be called with a real TransactionBody
  const legacyTx = unsignedTx as any

  const fee = toAmounts(legacyTx.fee?.values || [])
  const change = toEntriesFromChange(legacyTx.change || [])
  const outputsEntries = toEntriesFromOutputs(legacyTx.outputs || [])
  const changeAddresses = Entries.toAddresses(change)
  // entries === (outputs - change)
  entries = entries ?? Entries.remove(outputsEntries, changeAddresses)
  const stakingBalances = await getBalanceForStakingCredentials(
    addressedUtxos.map((utxo) => ({
      receiver: utxo.receiver,
      amount: utxo.amount,
    })),
  )

  const yoroiTx: YoroiUnsignedTx = {
    entries,
    fee,
    change,
    staking: {
      withdrawals:
        legacyTx.withdrawals?.hasValue?.() && legacyTx.withdrawals.len?.() > 0
          ? Staking.toWithdrawals(legacyTx.withdrawals, primaryTokenId)
          : undefined,
      registrations:
        (legacyTx.registrations?.length || 0) > 0
          ? Staking.toRegistrations({
              registrations: legacyTx.registrations || [],
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      deregistrations:
        (legacyTx.deregistrations?.length || 0) > 0
          ? Staking.toDeregistrations({
              deregistrations: legacyTx.deregistrations || [],
              networkManager,
              primaryTokenId,
              keyDeposit,
            })
          : undefined,
      delegations:
        (legacyTx.delegations?.length || 0) > 0
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
    metadata: toMetadata(legacyTx.metadata || []),
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

const toEntriesFromChange = (
  changes: ReadonlyArray<any>,
): TransactionOutput[] => {
  return changes.map((change) => ({
    address: toDisplayAddress(change.address),
    amounts: toAmounts(change.values?.values || []),
  }))
}

export const toEntriesFromOutputs = (
  outputs: ReadonlyArray<{
    address: string
    value: MultiTokenValue | {values: Array<CardanoTypes.TokenEntry>}
    datum?: Datum
  }>,
): TransactionOutput[] => {
  return outputs.map((output) => ({
    address: toDisplayAddress(output.address),
    amounts: toAmounts(
      'values' in output.value ? output.value.values : (output.value as any).values || []
    ),
    datum: output.datum,
  }))
}

const Staking = {
  toWithdrawals: (
    withdrawals: any,
    primaryTokenId: string,
  ): TransactionOutput[] => {
    if (!withdrawals?.hasValue?.()) return [] // no withdrawals

    const result: TransactionOutput[] = []
    const length = withdrawals.len?.() || 0
    const rewardAddresses = withdrawals.keys?.() || {get: () => null}

    for (let i = 0; i < length; i++) {
      const rewardAddress = rewardAddresses.get(i)
      if (!rewardAddress) continue
      const amount = (withdrawals.get?.(rewardAddress)?.toStr?.() ??
        Quantities.zero) as Balance.Quantity
      const address = Buffer.from(rewardAddress.toAddress?.()?.toBytes?.() || []).toString(
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
    deregistrations: Array<{stakeCredential(): any}>
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): TransactionOutput[] =>
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
    registrations: Array<{stakeCredential(): any}>
    networkManager: Network.Manager
    primaryTokenId: string
    keyDeposit: string
  }): TransactionOutput[] => {
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
  }): TransactionOutput[] =>
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
