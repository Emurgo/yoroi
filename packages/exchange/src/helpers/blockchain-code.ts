import {Exchange} from '@yoroi/types'

const supportedBlockchainCodes: Readonly<Exchange.BlockchainCode[]> = [
  'ADA',
] as const

export function isBlockchainCode(value: any): value is Exchange.BlockchainCode {
  return supportedBlockchainCodes.includes(value as Exchange.BlockchainCode)
}
