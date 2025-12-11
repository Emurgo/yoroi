import {YoroiWallet} from '@yoroi/cardano-wallet'
import {asQuantity} from '@yoroi/cardano-wallet'
import {collateralConfig} from '@yoroi/cardano-wallet'
import {TransactionOutput} from '@yoroi/tx'
import {App, Branded} from '@yoroi/types'

const getCollateralAddress = (wallet: YoroiWallet) => {
  const address = wallet.externalAddresses()[0]
  if (!address) throw new App.Errors.InvalidState('No External Address')
  return address
}

export const createCollateralEntry = (
  wallet: YoroiWallet,
  amount?: string,
): TransactionOutput => {
  const collateralAmount = amount
    ? asQuantity(amount)
    : collateralConfig.minLovelace
  return {
    address: Branded.asAddress(getCollateralAddress(wallet)),
    amounts: {
      [wallet.portfolioPrimaryTokenInfo.id]: collateralAmount,
    },
  }
}
