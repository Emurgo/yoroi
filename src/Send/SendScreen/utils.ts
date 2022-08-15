/* eslint-disable @typescript-eslint/no-explicit-any */
import {AssetOverflowError, NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib-core/dist/errors'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import {IntlShape} from 'react-intl'

import {formatTokenAmount, formatTokenInteger, normalizeTokenAmount} from '../../legacy/format'
import {getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../../legacy/networks'
import {RawUtxo} from '../../legacy/types'
import {cardanoValueFromMultiToken} from '../../legacy/utils'
import type {DefaultAsset, SendTokenList, Token} from '../../types'
import {BigNum, minAdaRequired, MultiToken, YoroiWallet} from '../../yoroi-wallets'
import {Quantity, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {InvalidAssetAmount, parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import type {AddressValidationErrors} from '../../yoroi-wallets/utils/validators'
import {getUnstoppableDomainAddress, isReceiverAddressValid, validateAmount} from '../../yoroi-wallets/utils/validators'
import {amountInputErrorMessages, messages} from './strings'

export const getMinAda = async (selectedToken: Token, primaryAsset: DefaultAsset) => {
  const networkConfig = getCardanoNetworkConfigById(primaryAsset.networkId)
  const fakeAmount = new BigNumber('0') // amount doesn't matter for calculating min UTXO amount
  const fakeMultitoken = new MultiToken(
    [
      {
        identifier: primaryAsset.identifier,
        networkId: primaryAsset.networkId,
        amount: fakeAmount,
      },
      {
        identifier: selectedToken.identifier,
        networkId: selectedToken.networkId,
        amount: fakeAmount,
      },
    ],
    {
      defaultNetworkId: primaryAsset.networkId,
      defaultIdentifier: primaryAsset.identifier,
    },
  )
  const minAmount = await minAdaRequired(
    await cardanoValueFromMultiToken(fakeMultitoken),
    await BigNum.fromStr(networkConfig.MINIMUM_UTXO_VAL),
  )
  // if the user is sending a token, we need to make sure the resulting utxo
  // has at least the minimum amount of ADA in it
  return minAmount.toStr()
}

export const getTransactionData = async (
  wallet: YoroiWallet,
  utxos: Array<RawUtxo>,
  address: string,
  amount: string,
  sendAll: boolean,
  primaryAsset: DefaultAsset,
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
      token: primaryAsset,
      amount: await getMinAda(selectedToken, primaryAsset),
    })
  }
  return wallet.createUnsignedTx(utxos, address, sendTokenList, primaryAsset)
}

export const recomputeAll = async ({
  wallet,
  amount,
  addressInput,
  utxos,
  sendAll,
  primaryAsset,
  selectedTokenInfo,
  defaultAssetAvailableAmount,
  selectedAssetAvailableAmount,
}: {
  wallet: YoroiWallet
  addressInput: string
  amount: string
  utxos: Array<RawUtxo> | undefined | null
  sendAll: boolean
  primaryAsset: DefaultAsset
  selectedTokenInfo: Token
  defaultAssetAvailableAmount: Quantity
  selectedAssetAvailableAmount: Quantity
}) => {
  let addressErrors: AddressValidationErrors = {}
  let address = addressInput
  let amountErrors = validateAmount(amount, selectedTokenInfo)

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
        !selectedTokenInfo.isDefault && isHaskellShelleyNetwork(selectedTokenInfo.networkId)
          ? ((await getMinAda(selectedTokenInfo, primaryAsset)) as Quantity)
          : '0'

      if (sendAll) {
        yoroiUnsignedTx = await getTransactionData(
          wallet,
          utxos,
          address,
          amount,
          sendAll,
          primaryAsset,
          selectedTokenInfo,
        )

        fee = yoroiUnsignedTx.fee[primaryAsset.identifier]

        if (selectedTokenInfo.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            new BigNumber(Quantities.diff(defaultAssetAvailableAmount, fee)),
            selectedTokenInfo,
          ).toString()

          balanceAfter = '0'
        } else {
          recomputedAmount = normalizeTokenAmount(
            new BigNumber(selectedAssetAvailableAmount),
            selectedTokenInfo,
          ).toString()

          balanceAfter = Quantities.diff(defaultAssetAvailableAmount, Quantities.sum([fee, minAda]))
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedTokenInfo.isDefault
          ? (parseAmountDecimal(amount, selectedTokenInfo).toString() as Quantity)
          : '0'

        yoroiUnsignedTx = await getTransactionData(
          wallet,
          utxos,
          address,
          amount,
          false,
          primaryAsset,
          selectedTokenInfo,
        )

        fee = yoroiUnsignedTx.fee[primaryAsset.identifier]

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
  primaryAsset: DefaultAsset,
) => {
  if (amountErrors.invalidAmount != null) {
    const msgOptions = {}
    if (amountErrors.invalidAmount === InvalidAssetAmount.ERROR_CODES.LT_MIN_UTXO) {
      const networkConfig = getCardanoNetworkConfigById(primaryAsset.networkId)
      const amount = new BigNumber(networkConfig.MINIMUM_UTXO_VAL)
      // remove decimal part if it's equal to 0
      const decimalPart = amount.modulo(Math.pow(10, primaryAsset.metadata.numberOfDecimals))
      const minUtxo = decimalPart.eq('0')
        ? formatTokenInteger(amount, primaryAsset)
        : formatTokenAmount(amount, primaryAsset)
      const ticker = primaryAsset.metadata.ticker
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
