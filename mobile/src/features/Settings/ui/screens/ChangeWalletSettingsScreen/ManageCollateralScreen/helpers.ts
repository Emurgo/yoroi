import {App} from '@yoroi/types'

import {YoroiWallet} from '~/wallets/cardano/types'
import {collateralConfig} from '~/wallets/cardano/utxoManager/utxos'
import {YoroiEntry} from '~/wallets/types/yoroi'

const getCollateralAddress = (wallet: YoroiWallet) => {
  const address = wallet.externalAddresses[0]
  if (!address) throw new App.Errors.InvalidState('No External Address')
  return address
}

export const createCollateralEntry = (wallet: YoroiWallet): YoroiEntry => {
  return {
    address: getCollateralAddress(wallet),
    amounts: {
      [wallet.portfolioPrimaryTokenInfo.id]: collateralConfig.minLovelace,
    },
  }
}
