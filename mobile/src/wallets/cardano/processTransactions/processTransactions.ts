/**
 * @deprecated This file is deprecated. Use useFormattedTxFromWalletTransaction hook from ReviewTx instead.
 * This file will be removed in a future version.
 *
 * Legacy transaction processing logic. Kept temporarily for backward compatibility.
 */
import {isArray, isString} from '@yoroi/common'
import {CertificateKind} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'
import {
  BaseAsset,
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TransactionInfo,
  WalletTransaction,
} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {TransactionToken} from '~/wallets/types/tokens'
import {Amounts, Quantities, asQuantity} from '~/wallets/utils/utils'

const ASSURANCE_LEVELS = {
  LOW: 3,
  MEDIUM: 9,
} as const

type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

/**
 * Calculate transaction assurance level based on status and confirmations
 */
const getTransactionAssurance = (
  status: (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS],
  confirmations: number,
): TransactionAssurance => {
  if (status === TRANSACTION_STATUS.PENDING) return 'PENDING'
  if (status === TRANSACTION_STATUS.FAILED) return 'FAILED'

  if (status !== TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Internal error - unknown transaction status')
  }

  if (confirmations < ASSURANCE_LEVELS.LOW) return 'LOW'
  if (confirmations < ASSURANCE_LEVELS.MEDIUM) return 'MEDIUM'
  return 'HIGH'
}

/**
 * Extract unique tokens from transaction inputs and outputs
 */
const extractTransactionTokens = (
  tx: WalletTransaction,
): Record<string, TransactionToken> => {
  const tokens: Record<string, TransactionToken> = {}
  const allAssets: BaseAsset[] = []

  // Collect all assets from inputs and outputs
  tx.inputs.forEach((input) => allAssets.push(...input.assets))
  tx.outputs.forEach((output) => allAssets.push(...output.assets))

  // Create TransactionToken for each unique asset
  for (const asset of allAssets) {
    if (tokens[asset.tokenId] == null) {
      tokens[asset.tokenId] = {
        isDefault: false,
        identifier: asset.tokenId,
        policyId: asset.policyId,
        assetName: asset.name,
        numberOfDecimals: 0,
        ticker: null,
        longName: null,
      }
    }
  }

  return tokens
}

/**
 * Convert remote asset format to Balance.Amounts
 */
const remoteAssetsToAmounts = (
  assets: BaseAsset[],
  primaryTokenId: string,
): Balance.Amounts => {
  const amounts: Balance.Amounts = {}

  for (const asset of assets) {
    // For primary token, tokenId might be empty, use primaryTokenId instead
    const tokenId =
      !asset.tokenId || asset.tokenId === ('' as Portfolio.Token.Id)
        ? primaryTokenId
        : asset.tokenId
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
          tokenId: '' as Portfolio.Token.Id,
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
 * Process transaction metadata from remote format
 */
const processMetadata = (
  metadata: WalletTransaction['metadata'],
): TransactionInfo['metadata'] => {
  if (!metadata) return undefined

  const result: Record<string, string> = {}

  for (const item of metadata) {
    if (!item?.label) continue

    const msg = item.map_json?.msg
    if (isArray(msg)) {
      result[item.label] = msg.join('')
    } else if (isString(msg)) {
      result[item.label] = msg
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
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
): (typeof TRANSACTION_DIRECTION)[keyof typeof TRANSACTION_DIRECTION] => {
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
 * @deprecated This function is deprecated. Use useFormattedTxFromWalletTransaction hook instead.
 * This function will be removed in a future version.
 *
 * Process transaction history data into TransactionInfo format
 */
export const processTxHistoryData = (
  tx: WalletTransaction,
  ownAddresses: string[],
  confirmations: number,
  memo: string | null,
  primaryTokenInfo: Portfolio.Token.Info,
): TransactionInfo => {
  const primaryTokenId = primaryTokenInfo.id

  // Process metadata
  const metadata = processMetadata(tx.metadata)

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
  let fee: Balance.Amounts | null

  const remoteFee = tx.fee
    ? Amounts.negated({[primaryTokenId]: asQuantity(tx.fee)} as Balance.Amounts)
    : null

  if (isInvalidScriptExecution) {
    amount = brutto
    fee = null // Collateral is the fee when execution fails
  } else if (isIntraWallet) {
    amount = {} as Balance.Amounts
    fee = remoteFee ?? totalFee
  } else if (isMultiParty) {
    amount = brutto
    fee = null
  } else if (hasOnlyOwnInputs) {
    amount = Amounts.diff(brutto, totalFee)
    fee = remoteFee ?? totalFee
  } else {
    amount = brutto
    fee = null
  }

  // Get assurance level and tokens
  const assurance = getTransactionAssurance(tx.status, confirmations)
  const tokens = extractTransactionTokens(tx)

  // Convert BaseAsset to CardanoTypes.TokenEntry format (for IOData)
  const assetToTokenEntry = (asset: BaseAsset) => ({
    identifier: asset.tokenId,
    amount: new BigNumber(asset.amount),
  })

  return {
    id: tx.id,
    inputs: tx.inputs.map((input) => ({
      address: input.address,
      amount: input.amount,
      assets: input.assets.map(assetToTokenEntry),
      id: input.id,
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount,
      assets: output.assets.map(assetToTokenEntry),
    })),
    amount, // Balance.Amounts directly
    fee, // Balance.Amounts | null directly
    delta, // Balance.Amounts directly
    confirmations,
    direction,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    assurance,
    tokens,
    blockNumber: tx.blockNum ?? 0,
    memo,
    metadata,
  }
}
