import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {normalizeToAddress} from '../../../yoroi-wallets/cardano/utils'
import {collateralConfig} from '../../../yoroi-wallets/cardano/utxoManager/utxos'
import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'

const getCollateralAddress = (wallet: YoroiWallet) => {
  return wallet.externalAddresses[0]
}

const getCollateralAmountInLovelace = () => {
  return collateralConfig.minLovelace
}

export const createCollateralEntry = (wallet: YoroiWallet): YoroiEntry => {
  return {
    address: getCollateralAddress(wallet),
    amounts: {
      [wallet.primaryTokenInfo.id]: getCollateralAmountInLovelace(),
    },
  }
}
