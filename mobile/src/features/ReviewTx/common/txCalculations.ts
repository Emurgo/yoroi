import {Quantities} from '@yoroi/cardano-wallet/utils/utils'
import {Balance, Portfolio} from '@yoroi/types'

import {FormattedOutput, FormattedOutputs} from './types'

type TokenAmount = {
  tokenInfo: Portfolio.Token.Info
  quantity: Balance.Quantity
}

/**
 * Groups assets from inputs or outputs by token ID and sums their quantities
 * Prefers real tokenInfo (not unknown) over unknown tokenInfo when multiple exist
 */
export const groupAssetsByToken = (
  items: Array<{
    assets: Array<{tokenInfo: Portfolio.Token.Info; quantity: Balance.Quantity}>
  }>,
): Map<Portfolio.Token.Id, TokenAmount> => {
  const grouped = new Map<Portfolio.Token.Id, TokenAmount>()

  items.forEach((item) => {
    item.assets.forEach((asset) => {
      const existing = grouped.get(asset.tokenInfo.id)
      if (existing) {
        // Prefer real tokenInfo over unknown tokenInfo
        const preferredTokenInfo =
          asset.tokenInfo.status !== Portfolio.Token.Status.Unknown
            ? asset.tokenInfo
            : existing.tokenInfo

        grouped.set(asset.tokenInfo.id, {
          tokenInfo: preferredTokenInfo,
          quantity: Quantities.sum([existing.quantity, asset.quantity]),
        })
      } else {
        grouped.set(asset.tokenInfo.id, {
          tokenInfo: asset.tokenInfo,
          quantity: asset.quantity,
        })
      }
    })
  })

  return grouped
}
/**
 * Calculates sends and receives by comparing inputs and outputs
 */
export const calculateSendsAndReceives = (
  inputsByToken: Map<Portfolio.Token.Id, TokenAmount>,
  outputsByToken: Map<Portfolio.Token.Id, TokenAmount>,
  _options?: {
    primaryTokenId?: Portfolio.Token.Id
    fee?: Balance.Quantity
    operationsFee?: Balance.Quantity
  },
): {
  sends: Array<TokenAmount>
  receives: Array<TokenAmount>
} => {
  const sends: Array<TokenAmount> = []

  // Calculate sends: (input - output) if positive
  // The diff already includes:
  // - The transaction fee (burned, so outputs are less than inputs)
  // - Operation deposits (keyDeposit, poolDeposit) are included in outputs as UTXOs,
  //   so they're already accounted for in the diff
  // Therefore, we should NOT add operationsFee again as it would double-count deposits
  inputsByToken.forEach((inputAsset, tokenId) => {
    const outputAsset = outputsByToken.get(tokenId)
    const outputQty = outputAsset?.quantity ?? Quantities.zero
    const diff = Quantities.diff(inputAsset.quantity, outputQty)

    if (Quantities.isGreaterThan(diff, Quantities.zero)) {
      sends.push({
        tokenInfo: inputAsset.tokenInfo,
        quantity: diff,
      })
    }
  })

  // Calculate receives: (output - input) if positive
  // This handles both cases:
  // 1. Tokens that appear in both inputs and outputs: add (output - input) if positive
  // 2. Tokens that only appear in outputs: add full output quantity (since inputQty will be zero)
  // Use a Map to ensure each token only appears once
  // Prefer tokenInfo from inputs (more likely to have real tokenInfo) over outputs (might have unknown tokenInfo)
  const receivesByToken = new Map<Portfolio.Token.Id, TokenAmount>()

  outputsByToken.forEach((outputAsset, tokenId) => {
    const inputAsset = inputsByToken.get(tokenId)
    const inputQty = inputAsset?.quantity ?? Quantities.zero
    const diff = Quantities.diff(outputAsset.quantity, inputQty)

    if (Quantities.isGreaterThan(diff, Quantities.zero)) {
      // Prefer input tokenInfo if available (more likely to have real tokenInfo with correct decimals)
      // Otherwise fall back to output tokenInfo
      const preferredTokenInfo =
        inputAsset &&
        inputAsset.tokenInfo.status !== Portfolio.Token.Status.Unknown
          ? inputAsset.tokenInfo
          : outputAsset.tokenInfo

      receivesByToken.set(tokenId, {
        tokenInfo: preferredTokenInfo,
        quantity: diff,
      })
    }
  })

  return {sends, receives: Array.from(receivesByToken.values())}
}

/**
 * Gets a unique address identifier for grouping outputs by address
 */
const getAddressKey = (output: FormattedOutput): string => {
  // Use rewardAddress if available, otherwise use address
  return output.rewardAddress ?? output.address
}

/**
 * Groups outputs by address (using rewardAddress or address as the key)
 */
export const groupOutputsByAddress = (
  outputs: FormattedOutputs,
): Map<string, FormattedOutputs> => {
  const grouped = new Map<string, FormattedOutputs>()

  outputs.forEach((output) => {
    const addressKey = getAddressKey(output)
    const existing = grouped.get(addressKey)
    if (existing) {
      grouped.set(addressKey, [...existing, output])
    } else {
      grouped.set(addressKey, [output])
    }
  })

  return grouped
}
