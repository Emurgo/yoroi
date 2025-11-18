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
    // tokenId is Portfolio.Token.Id, so empty string check is not needed
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

  // ============================================================================
  // CALCULATE NET BALANCE CHANGE FROM SCRATCH
  // ============================================================================
  // Net balance change = (what I received) - (what I spent)
  // This already includes fees because fees reduce the outputs

  // Step 1: Sum all ADA from inputs that belong to me
  // This includes:
  // - UTXO inputs from my addresses
  // - Collateral inputs (if script execution failed)
  // - Implicit inputs (rewards, etc.)
  const ownInputAmounts = Amounts.sum([
    remoteDataToAmounts(ownUtxoInputs, primaryTokenId),
    remoteDataToAmounts(ownUtxoCollateralInputs, primaryTokenId),
    ownImplicitInput,
  ])

  // Step 2: Sum all ADA from outputs that belong to me
  // This includes:
  // - UTXO outputs to my addresses (withdrawals are already included here!)
  // - Implicit outputs (rewards from certificates)
  // NOTE: Withdrawals are NOT added separately because they are already
  // included in the UTXO outputs. When you withdraw rewards, they are added
  // to a UTXO output in the transaction, so counting them separately would
  // double-count them.
  const ownOutputAmounts = Amounts.sum([
    remoteDataToAmounts(ownUtxoOutputs, primaryTokenId),
    ownImplicitOutput,
  ])

  // For fee calculation: need total inputs/outputs
  // Withdrawals are already in utxoOutputs, so don't add them separately
  const unifiedInputs = [...utxoInputs, ...ownUtxoCollateralInputs]
  const unifiedOutputs = [...utxoOutputs]

  const ownInputs = unifiedInputs.filter((input) =>
    ownAddresses.includes(input.address),
  )
  const ownOutputs = unifiedOutputs.filter((output) =>
    ownAddresses.includes(output.address),
  )

  // Step 3: Calculate net balance change
  // Net change = outputs - inputs
  // - Positive = I received more than I spent (net gain)
  // - Negative = I spent more than I received (net loss, includes fees)
  // - Zero = break even (rare, only if fees exactly match received amount)
  const netBalanceChange = Amounts.diff(ownOutputAmounts, ownInputAmounts)

  // Step 4: Calculate total fee (for reference, not used in amount calculation)
  // Fee = total outputs - total inputs (negative because fees reduce outputs)
  const totalIn = remoteDataToAmounts(unifiedInputs, primaryTokenId)
  const totalOut = remoteDataToAmounts(unifiedOutputs, primaryTokenId)
  const totalFee = Amounts.diff(totalOut, totalIn)

  // Step 5: Determine transaction characteristics for direction
  const hasOnlyOwnInputs = ownInputs.length === unifiedInputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === unifiedOutputs.length

  // Step 6: Determine direction
  const direction = determineTransactionDirection(
    hasOnlyOwnInputs,
    hasOnlyOwnOutputs,
    ownInputs.length > 0,
    isInvalidScriptExecution,
  )

  // Step 7: Calculate delta (for balance computation - UTXO change only)
  const delta = Amounts.diff(
    remoteDataToAmounts(ownUtxoOutputs, primaryTokenId),
    remoteDataToAmounts(ownUtxoInputs, primaryTokenId),
  )

  // Step 8: Set amount to net balance change
  // This is the actual change to the wallet balance, including fees
  const amount = netBalanceChange

  return {
    id: tx.id,
    direction,
    amount,
    delta,
    fee: totalFee,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    certificates: tx.certificates,
    withdrawals: tx.withdrawals,
    metadata: tx.metadata,
    inputs: tx.inputs,
    outputs: tx.outputs,
  }
}
