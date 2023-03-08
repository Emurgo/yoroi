import {isReceiverAddressValid} from '../utils'
import {NetworkInfo} from './types'

const networkInfo: NetworkInfo = {
  id: 1,
  displayName: 'Cardano',
  primaryTokenId: '',
  getTime(currentTimeMS: number) {
    // mainnet
    const shelleyStartTimeMS = 1506203091000
    const absoluteSlot = Math.floor((currentTimeMS - shelleyStartTimeMS) / 1000)
    const slotsPerEpoch = 5 * 24 * 60 * 60
    const epoch = Math.floor(absoluteSlot / slotsPerEpoch)
    const slotsInPreviousEpochs = epoch * slotsPerEpoch
    const slot = Math.floor(absoluteSlot - slotsInPreviousEpochs)
    const slotsRemaining = Math.floor(slotsPerEpoch - slot)
    const secondsRemainingInEpoch = slotsRemaining * 1
    const percentageElapsed = Math.floor((100 * slot) / slotsPerEpoch)

    return {
      epoch,
      slot,
      absoluteSlot,
      slotsRemaining,
      slotsPerEpoch,
      secondsRemainingInEpoch,
      percentageElapsed,
    }
  },

  validateAddress(address: string) {
    return isReceiverAddressValid(address, 1)
  },

  explorers: {
    addressExplorer: (address: string) => `https://cardanoscan.io/address/${address}`,
    transactionExplorer: (txid: string) => `https://cardanoscan.io/transaction/${txid}`,
    poolExplorer: (_poolId: string) => 'https://adapools.yoroiwallet.com/',
    tokenExplorer: (fingerprint: string) =>
      fingerprint ? `https://cardanoscan.io/token/${fingerprint}` : 'https://cardanoscan.io/tokens',
  },
} as const

const PRIMARY_TOKEN_INFO = {
  id: networkInfo.primaryTokenId,
  name: 'ADA',
  decimals: 6,
  description: networkInfo.displayName,
  ticker: 'ADA',
  symbol: '₳',
  logo: '',
  url: '',
  fingerprint: '',
  group: '',
} as const

const PRIMARY_TOKEN = {
  identifier: networkInfo.primaryTokenId,
  networkId: networkInfo.id,
  isDefault: true,
  metadata: {
    type: 'Cardano',
    policyId: '',
    assetName: '',
    numberOfDecimals: 6,
    ticker: 'ADA',
    longName: null,
    maxSupply: '45000000000000000',
  },
} as const

export const mainnet = {
  networkInfo,
  PRIMARY_TOKEN,
  PRIMARY_TOKEN_INFO
}