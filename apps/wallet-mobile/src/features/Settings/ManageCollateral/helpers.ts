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

  const txBody = await unsignedTx.unsignedTx.txBuilder.build()
  const outputs = await txBody.outputs()
  const outputsLength = await outputs.len()

  for (let i = 0; i < outputsLength; i++) {
    const output = await outputs.get(i)
    const outputAddressHexStr = await output.address().then((a) => a?.toHex())

    const outputAmount = await output.amount()
    const outputLovelace = await outputAmount.coin().then((c) => c.toStr())

    const outputValueMatch = outputLovelace === collateralAmount
    const outputAddressMatch = outputAddressHexStr === collateralAddress

    if (outputAddressMatch && outputValueMatch) {
      return i
    }
  }

  return outputIndex
}
