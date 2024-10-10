import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {collateralConfig} from '../../../yoroi-wallets/cardano/utxoManager/utxos'
import {YoroiEntry} from '../../../yoroi-wallets/types/yoroi'

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
