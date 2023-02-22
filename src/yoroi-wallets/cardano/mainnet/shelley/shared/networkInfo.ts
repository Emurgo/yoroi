import { NetworkInfo } from '../../../../types/networkInfo'
import {isReceiverAddressValid} from '../../eras/shelley/util'

export const networkInfo: NetworkInfo = {
  id: 'cardano',
  displayName: 'Cardano',
  primaryTokenId: '',
  mnemonicLength: 15,

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

  validateAddress: isReceiverAddressValid,

  explorers: {
    addressExplorer: (address: string) => `https://cardanoscan.io/address/${address}`,
    transactionExplorer: (txid: string) => `https://cardanoscan.io/transaction/${txid}`,
    poolExplorer: (_poolId: string) => 'https://adapools.yoroiwallet.com/',
    tokenExplorer: (fingerprint: string) =>
      fingerprint ? `https://cardanoscan.io/token/${fingerprint}` : 'https://cardanoscan.io/tokens',
    // blockExplorer: (blockId: string) => "",
    // nftExplorer: (nftId: string) => "",
    // fundExplorer: () => "",
  },
}
