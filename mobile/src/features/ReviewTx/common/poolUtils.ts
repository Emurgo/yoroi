import {FullPoolInfo} from '@emurgo/yoroi-lib'

/**
 * Pool utility functions
 * Extracted to avoid circular dependencies
 */
export const generatePoolName = (poolInfo: FullPoolInfo) => {
  return poolInfo.explorer != null
    ? `[${poolInfo.explorer.ticker}] ${poolInfo.explorer.name}`
    : null
}
