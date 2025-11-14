import {CertificateKind} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'

import {
  BaseAsset,
  TRANSACTION_DIRECTION,
  TRANSACTION_TYPE,
  TransactionDirection,
  WalletTransaction,
} from '~/wallets/types/other'
import {Amounts, Quantities, asQuantity} from '~/wallets/utils/utils'

import {TransactionSummary} from './types'

/**
 * Convert remote asset format to Balance.Amounts
 */
const remoteAssetsToAmounts = (
  assets: BaseAsset[],
  primaryTokenId: string,
): Balance.Amounts => {
  const amounts: Balance.Amounts = {}

  for (const asset of assets) {
    // Handle empty tokenId or primary token - use primaryTokenId
    // tokenId is Portfolio.Token.Id which is `${string}.${string}`, so empty string check is not needed
    const tokenId =
      asset.tokenId === primaryTokenId ? primaryTokenId : asset.tokenId
    const existing = amounts[tokenId]
    amounts[tokenId] = existing
      ? Quantities.sum([existing, asQuantity(asset.amount)])
      : asQuantity(asset.amount)
  }

  return amounts
}

/**
 * Convert remote transaction data to Balance.Amounts
 */
const remoteDataToAmounts = (
  data: Array<{
    address: string
    amount: string
    assets: BaseAsset[]
  }>,
  primaryTokenId: string,
): Balance.Amounts => {
  return data.reduce<Balance.Amounts>((acc, item) => {
    const primaryAmount = remoteAssetsToAmounts(
      [
        {
          tokenId: primaryTokenId as Portfolio.Token.Id,
          amount: item.amount,
          policyId: '',
          name: '',
        },
      ],
      primaryTokenId,
    )
    const assetAmounts = remoteAssetsToAmounts(item.assets, primaryTokenId)
    return Amounts.sum([acc, primaryAmount, assetAmounts])
  }, {} as Balance.Amounts)
}

/**
 * Calculate implicit output from MoveInstantaneousRewards certificates
 */
const calculateImplicitOutput = (
  tx: WalletTransaction,
  ownAddresses: string[],
  primaryTokenId: string,
): Balance.Amounts => {
  if (tx.type !== TRANSACTION_TYPE.SHELLEY) {
    return {} as Balance.Amounts
  }

  let totalRewards = Quantities.zero

  for (const cert of tx.certificates) {
    if (cert.kind !== CertificateKind.MoveInstantaneousRewardsCert) {
      continue
    }

    const rewards = (cert as {rewards?: Record<string, string>}).rewards
    if (!rewards) continue

    for (const [rewardAddr, amount] of Object.entries(rewards)) {
      if (ownAddresses.includes(rewardAddr)) {
        totalRewards = Quantities.sum([totalRewards, asQuantity(amount)])
      }
    }
  }

  return totalRewards !== Quantities.zero
    ? ({[primaryTokenId]: totalRewards} as Balance.Amounts)
    : ({} as Balance.Amounts)
}

/**
 * Determine transaction direction based on ownership of inputs/outputs
 */
const determineTransactionDirection = (
  hasOnlyOwnInputs: boolean,
  hasOnlyOwnOutputs: boolean,
  hasOwnInputs: boolean,
  isInvalidScriptExecution: boolean,
): TransactionDirection => {
  if (isInvalidScriptExecution) {
    return TRANSACTION_DIRECTION.SELF
  }

  if (hasOnlyOwnInputs && hasOnlyOwnOutputs) {
    return TRANSACTION_DIRECTION.SELF
  }

  if (hasOwnInputs && !hasOnlyOwnInputs) {
    return TRANSACTION_DIRECTION.MULTI
  }

  if (hasOnlyOwnInputs) {
    return TRANSACTION_DIRECTION.SENT
  }

  return TRANSACTION_DIRECTION.RECEIVED
}

/**
 * Convert WalletTransaction to TransactionSummary for list display
 * Reuses logic from processTransactions but returns a simpler summary format
 */
export const walletTransactionToSummary = (
  tx: WalletTransaction,
  ownAddresses: string[],
  primaryTokenInfo: Portfolio.Token.Info,
): TransactionSummary => {
  const primaryTokenId = primaryTokenInfo.id

  // Handle script execution failures
  const collateral = tx.collateralInputs || []
  const isNonNativeScriptExecution =
    Number(tx.scriptSize || 0) > 0 || collateral.length > 0
  const isInvalidScriptExecution =
    isNonNativeScriptExecution && !tx.validContract

  // Filter inputs/outputs based on script execution status
  const utxoInputs = isInvalidScriptExecution ? [] : tx.inputs
  const utxoOutputs = isInvalidScriptExecution ? [] : tx.outputs

  // Handle collateral inputs (only count if script execution failed)
  const ownUtxoCollateralInputs = isInvalidScriptExecution
    ? collateral.filter((input) => ownAddresses.includes(input.address))
    : []

  // Convert withdrawals to input format for accounting
  const accountingInputs = isInvalidScriptExecution
    ? []
    : tx.withdrawals.map((withdrawal) => ({
        address: withdrawal.address,
        amount: withdrawal.amount,
        assets: [],
      }))

  // Filter own addresses
  const ownUtxoInputs = utxoInputs.filter((input) =>
    ownAddresses.includes(input.address),
  )
  const ownUtxoOutputs = utxoOutputs.filter((output) =>
    ownAddresses.includes(output.address),
  )

  // Calculate implicit inputs/outputs
  const ownImplicitInput: Balance.Amounts = {} as Balance.Amounts
  const ownImplicitOutput = calculateImplicitOutput(
    tx,
    ownAddresses,
    primaryTokenId,
  )

  // Combine all inputs and outputs
  const unifiedInputs = [
    ...utxoInputs,
    ...accountingInputs,
    ...ownUtxoCollateralInputs,
  ]
  const unifiedOutputs = [...utxoOutputs]

  const ownInputs = unifiedInputs.filter((input) =>
    ownAddresses.includes(input.address),
  )
  const ownOutputs = unifiedOutputs.filter((output) =>
    ownAddresses.includes(output.address),
  )

  // Calculate totals using modern Balance.Amounts
  const totalIn = remoteDataToAmounts(unifiedInputs, primaryTokenId)
  const totalOut = remoteDataToAmounts(unifiedOutputs, primaryTokenId)
  const ownIn = Amounts.sum([
    remoteDataToAmounts(ownInputs, primaryTokenId),
    ownImplicitInput,
  ])
  const ownOut = Amounts.sum([
    remoteDataToAmounts(ownOutputs, primaryTokenId),
    ownImplicitOutput,
  ])

  // Determine transaction characteristics
  const hasOnlyOwnInputs = ownInputs.length === unifiedInputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === unifiedOutputs.length
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== unifiedInputs.length

  // Calculate brutto (net change) and total fee
  const brutto = Amounts.diff(ownOut, ownIn)
  const totalFee = Amounts.diff(totalOut, totalIn) // Should be negative

  // Calculate delta (for balance computation)
  const delta = Amounts.diff(
    remoteDataToAmounts(ownUtxoOutputs, primaryTokenId),
    remoteDataToAmounts(ownUtxoInputs, primaryTokenId),
  )

  // Determine direction, amount, and fee based on transaction type
  const direction = determineTransactionDirection(
    hasOnlyOwnInputs,
    hasOnlyOwnOutputs,
    ownInputs.length > 0,
    isInvalidScriptExecution,
  )

  let amount: Balance.Amounts

  if (isInvalidScriptExecution) {
    amount = brutto
  } else if (isIntraWallet) {
    amount = {} as Balance.Amounts
  } else if (isMultiParty) {
    amount = brutto
  } else if (hasOnlyOwnInputs) {
    amount = Amounts.diff(brutto, totalFee)
  } else {
    amount = brutto
  }

  return {
    id: tx.id,
    direction,
    amount,
    delta,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    certificates: tx.certificates,
    withdrawals: tx.withdrawals,
  }
}
