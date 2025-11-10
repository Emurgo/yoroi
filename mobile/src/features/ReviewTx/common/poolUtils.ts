import {FullPoolInfo} from '@yoroi/staking'

/**
 * Pool utility functions
 * Extracted to avoid circular dependencies
 */
export const generatePoolName = (poolInfo: FullPoolInfo) => {
  return poolInfo.explorer != null
    ? `[${poolInfo.explorer.ticker}] ${poolInfo.explorer.name}`
    : null
}
