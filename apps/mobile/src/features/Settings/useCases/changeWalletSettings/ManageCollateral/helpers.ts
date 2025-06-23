import {YoroiWallet} from '../../../../../wallets/cardano/types'
import {collateralConfig} from '../../../../../wallets/cardano/utxoManager/utxos'
import {YoroiEntry} from '../../../../../wallets/types/yoroi'

const getCollateralAddress = (wallet: YoroiWallet) => {
  return wallet.externalAddresses[0]
}

export const getCollateralAmountInLovelace = () => {
  return collateralConfig.minLovelace
}

export const createCollateralEntry = (wallet: YoroiWallet): YoroiEntry => {
  return {
    address: getCollateralAddress(wallet),
    amounts: {
      [wallet.portfolioPrimaryTokenInfo.id]: getCollateralAmountInLovelace(),
    },
  }
}
