/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import {IntlShape} from 'react-intl'

import {formatTokenAmount, formatTokenInteger, normalizeTokenAmount} from '../../legacy/format'
import {AssetOverflowError, getMinAda, NotEnoughMoneyToSendError, YoroiWallet} from '../../yoroi-wallets'
import {getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../../yoroi-wallets/cardano/networks'
import {DefaultAsset, Quantity, SendTokenList, Token, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {RawUtxo} from '../../yoroi-wallets/types/other'
import {Amounts, asQuantity, Quantities} from '../../yoroi-wallets/utils'
import {InvalidAssetAmount, parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import {validateAmount} from '../../yoroi-wallets/utils/validators'
import {amountInputErrorMessages} from './strings'

export const getTransactionData = async (
  wallet: YoroiWallet,
  address: string,
  amount: string,
  sendAll: boolean,
  selectedToken: Token,
) => {
  const sendTokenList: SendTokenList = []

  if (sendAll) {
    sendTokenList.push({
      token: selectedToken,
      shouldSendAll: true,
    })
  } else {
    const amountBigNum = parseAmountDecimal(amount, selectedToken)
    sendTokenList.push({
      token: selectedToken,
      amount: amountBigNum.toString(),
    })
  }
  if (!selectedToken.isDefault && isHaskellShelleyNetwork(selectedToken.networkId)) {
    sendTokenList.push({
      token: wallet.primaryToken,
      amount: await getMinAda(selectedToken, wallet.primaryToken),
    })
  }
  return wallet.createUnsignedTx(address, sendTokenList)
}

export const recomputeAll = async ({
  wallet,
  amount,
  addressInput,
  utxos,
  sendAll,
  selectedToken,
  defaultAssetAvailableAmount,
  selectedAssetAvailableAmount,
}: {
  wallet: YoroiWallet
  addressInput: string
  amount: string
  utxos: Array<RawUtxo> | undefined | null
  sendAll: boolean
  selectedToken: Token
  defaultAssetAvailableAmount: Quantity
  selectedAssetAvailableAmount: Quantity
}) => {
  let amountErrors = validateAmount(amount, selectedToken)

  let balanceErrors = Object.freeze({})
  let fee: Quantity | null = null
  let balanceAfter: null | Quantity = null
  let recomputedAmount = amount

  let yoroiUnsignedTx: YoroiUnsignedTx | null = null

  if (utxos) {
    try {
      // we'll substract minAda from ADA balance if we are sending a token
      const minAda =
        !selectedToken.isDefault && isHaskellShelleyNetwork(selectedToken.networkId)
          ? ((await getMinAda(selectedToken, wallet.primaryToken)) as Quantity)
          : '0'

      if (sendAll) {
        yoroiUnsignedTx = await getTransactionData(wallet, addressInput, amount, sendAll, selectedToken)

        fee = Amounts.getAmount(yoroiUnsignedTx.fee, wallet.primaryToken.identifier).quantity

        if (selectedToken.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            Quantities.diff(defaultAssetAvailableAmount, fee),
            selectedToken,
          ).toString()

          balanceAfter = '0'
        } else {
          recomputedAmount = normalizeTokenAmount(selectedAssetAvailableAmount, selectedToken).toString()

          balanceAfter = Quantities.diff(defaultAssetAvailableAmount, Quantities.sum([fee, minAda]))
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedToken.isDefault
          ? (parseAmountDecimal(amount, selectedToken).toString() as Quantity)
          : '0'

        yoroiUnsignedTx = await getTransactionData(wallet, addressInput, amount, false, selectedToken)

        fee = Amounts.getAmount(yoroiUnsignedTx.fee, wallet.primaryToken.identifier).quantity
        balanceAfter = Quantities.diff(defaultAssetAvailableAmount, Quantities.sum([parsedAmount, minAda, fee]))
      }
    } catch (err) {
      if (
        err instanceof NotEnoughMoneyToSendError ||
        err instanceof AssetOverflowError ||
        err instanceof InvalidAssetAmount
      ) {
        balanceErrors = {insufficientBalance: true}
      }
    }
  }

  return {
    amount: recomputedAmount,
    amountErrors,
    balanceErrors,
    fee,
    balanceAfter,
    yoroiUnsignedTx,
  }
}

export const getAmountErrorText = (
  intl: IntlShape,
  amountErrors: {invalidAmount?: string | number | null},
  balanceErrors: {insufficientBalance?: boolean; assetOverflow?: boolean},
  defaultAsset: DefaultAsset,
) => {
  if (amountErrors.invalidAmount != null) {
    const msgOptions = {}
    if (amountErrors.invalidAmount === InvalidAssetAmount.ERROR_CODES.LT_MIN_UTXO) {
      const networkConfig = getCardanoNetworkConfigById(defaultAsset.networkId)
      const amount = new BigNumber(networkConfig.MINIMUM_UTXO_VAL)
      // remove decimal part if it's equal to 0
      const decimalPart = amount.modulo(Math.pow(10, defaultAsset.metadata.numberOfDecimals))
      const minUtxo = decimalPart.eq('0')
        ? formatTokenInteger(asQuantity(amount), defaultAsset)
        : formatTokenAmount(asQuantity(amount), defaultAsset)
      const ticker = defaultAsset.metadata.ticker
      Object.assign(msgOptions, {minUtxo, ticker})
    }
    return intl.formatMessage(amountInputErrorMessages[amountErrors.invalidAmount], msgOptions)
  }
  if (balanceErrors.insufficientBalance === true) {
    return intl.formatMessage(amountInputErrorMessages.insufficientBalance)
  }
  if (balanceErrors.assetOverflow === true) {
    return intl.formatMessage(amountInputErrorMessages.assetOverflow)
  }

  return null
}
