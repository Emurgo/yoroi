import {isStringLiteral} from '@yoroi/common'
import {Exchange} from '@yoroi/types'

const supportedBlockchainCodes: Readonly<Exchange.BlockchainCode[]> = [
  'ADA',
] as const

export function isBlockchainCode(
  value: unknown,
): value is Exchange.BlockchainCode {
  return isStringLiteral(supportedBlockchainCodes, value)
}
