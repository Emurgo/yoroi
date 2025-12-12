import {FullPoolInfo} from '@yoroi/staking'

/**
 * Pool utility functions
 * Extracted to avoid circular dependencies
 */
export const generatePoolName = (poolInfo: FullPoolInfo | null | undefined) => {
  if (poolInfo?.explorer != null) {
    const {ticker, name} = poolInfo.explorer
    // Only return formatted name if both ticker and name are available
    // Otherwise return null to fallback to pool ID
    if (ticker != null && name != null) {
      return `[${ticker}] ${name}`
    }
  }
  return null
}
