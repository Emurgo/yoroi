import {App} from '@yoroi/types'
import {TransactionOutput} from '@yoroi/tx'

import {YoroiWallet} from '~/wallets/cardano/types'
import {collateralConfig} from '~/wallets/cardano/utxoManager/utxos'

const getCollateralAddress = (wallet: YoroiWallet) => {
  const address = wallet.externalAddresses[0]
  if (!address) throw new App.Errors.InvalidState('No External Address')
  return address
}

export const createCollateralEntry = (wallet: YoroiWallet): TransactionOutput => {
  return {
    address: getCollateralAddress(wallet),
    amounts: {
      [wallet.portfolioPrimaryTokenInfo.id]: collateralConfig.minLovelace,
    },
  }
}
