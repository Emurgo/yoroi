/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import {IntlShape} from 'react-intl'

import {formatTokenAmount, formatTokenInteger, normalizeTokenAmount} from '../../legacy/format'
import {getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../../legacy/networks'
import {AssetOverflowError, getMinAda, NotEnoughMoneyToSendError, YoroiWallet} from '../../yoroi-wallets'
import {DefaultAsset, Quantity, SendTokenList, Token, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {RawUtxo} from '../../yoroi-wallets/types/other'
import {Amounts, Quantities} from '../../yoroi-wallets/utils'
import {InvalidAssetAmount, parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import type {AddressValidationErrors} from '../../yoroi-wallets/utils/validators'
import {getUnstoppableDomainAddress, isReceiverAddressValid, validateAmount} from '../../yoroi-wallets/utils/validators'
import {amountInputErrorMessages, messages} from './strings'

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
  let addressErrors: AddressValidationErrors = {}
  let address = addressInput
  let amountErrors = validateAmount(amount, selectedToken)

  if (isDomain(addressInput)) {
    try {
      address = await getUnstoppableDomainAddress(addressInput)
    } catch (e) {
      addressErrors = JSON.parse((e as Error).message)
    }
  }

  if (_.isEmpty(addressErrors)) {
    addressErrors = (await isReceiverAddressValid(address, wallet.networkId)) || Object.freeze({})
  }

  let balanceErrors = Object.freeze({})
  let fee: Quantity | null = null
  let balanceAfter: null | Quantity = null
  let recomputedAmount = amount

  let yoroiUnsignedTx: YoroiUnsignedTx | null = null

  if (_.isEmpty(addressErrors) && utxos) {
    try {
      // we'll substract minAda from ADA balance if we are sending a token
      const minAda =
        !selectedToken.isDefault && isHaskellShelleyNetwork(selectedToken.networkId)
          ? ((await getMinAda(selectedToken, wallet.primaryToken)) as Quantity)
          : '0'

      if (sendAll) {
        yoroiUnsignedTx = await getTransactionData(wallet, address, amount, sendAll, selectedToken)

        fee = Amounts.getAmount(yoroiUnsignedTx.fee, wallet.primaryToken.identifier).quantity

        if (selectedToken.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            new BigNumber(Quantities.diff(defaultAssetAvailableAmount, fee)),
            selectedToken,
          ).toString()

          balanceAfter = '0'
        } else {
          recomputedAmount = normalizeTokenAmount(new BigNumber(selectedAssetAvailableAmount), selectedToken).toString()

          balanceAfter = Quantities.diff(defaultAssetAvailableAmount, Quantities.sum([fee, minAda]))
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedToken.isDefault
          ? (parseAmountDecimal(amount, selectedToken).toString() as Quantity)
          : '0'

        yoroiUnsignedTx = await getTransactionData(wallet, address, amount, false, selectedToken)

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
    address,
    amount: recomputedAmount,
    amountErrors,
    addressErrors,
    balanceErrors,
    fee,
    balanceAfter,
    yoroiUnsignedTx,
  }
}

export const getAddressErrorText = (intl: IntlShape, addressErrors: AddressValidationErrors) => {
  if (addressErrors.unsupportedDomain) {
    return intl.formatMessage(messages.domainUnsupportedError)
  }
  if (addressErrors.recordNotFound) {
    return intl.formatMessage(messages.domainRecordNotFoundError)
  }
  if (addressErrors.unregisteredDomain) {
    return intl.formatMessage(messages.domainNotRegisteredError)
  }
  if (addressErrors.invalidAddress === true) {
    return intl.formatMessage(messages.addressInputErrorInvalidAddress)
  }
  return ''
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
        ? formatTokenInteger(amount, defaultAsset)
        : formatTokenAmount(amount, defaultAsset)
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

export const isDomain = (addressInput: string) => /.+\..+/.test(addressInput)
export const hasDomainErrors = (addressErrors: AddressValidationErrors) =>
  addressErrors.unsupportedDomain || addressErrors.recordNotFound || addressErrors.unregisteredDomain
