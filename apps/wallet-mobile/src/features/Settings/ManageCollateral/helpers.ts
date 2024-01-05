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

export const findCollateralOutputIndex = async (wallet: YoroiWallet, unsignedTx: YoroiUnsignedTx) => {
  const collateralAddress = await normalizeToAddress(getCollateralAddress(wallet)).then((a) => a?.toHex())
  const collateralAmount = getCollateralAmountInLovelace()

  const outputIndex = -1

  if (!collateralAddress) return outputIndex

  for (let i = 0; i < unsignedTx.unsignedTx.outputs.length; i++) {
    const output = unsignedTx.unsignedTx.outputs[i]
    const normalizedOutputAddress = await normalizeToAddress(output.address).then((a) => a?.toHex())
    const outputAddressMatch = normalizedOutputAddress === collateralAddress
    const outputValueMatch = output.value.values[0].amount.eq(collateralAmount)

    if (outputAddressMatch && outputValueMatch) {
      return i
    }
  }

  return outputIndex
}
