/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import {IntlShape} from 'react-intl'

import {AssetOverflowError, InsufficientFunds} from '../../legacy/errors'
import {formatTokenAmount, formatTokenInteger, normalizeTokenAmount} from '../../legacy/format'
import {getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../../legacy/networks'
import {WalletMeta} from '../../legacy/state'
import {RawUtxo} from '../../legacy/types'
import {cardanoValueFromMultiToken} from '../../legacy/utils'
import type {DefaultAsset, SendTokenList, Token} from '../../types'
import {BigNum, HaskellShelleyTxSignRequest, minAdaRequired, MultiToken, walletManager} from '../../yoroi-wallets'
import {InvalidAssetAmount, parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import type {AddressValidationErrors} from '../../yoroi-wallets/utils/validators'
import {getUnstoppableDomainAddress, isReceiverAddressValid, validateAmount} from '../../yoroi-wallets/utils/validators'
import {amountInputErrorMessages, messages} from './strings'

export const getMinAda = async (selectedToken: Token, defaultAsset: DefaultAsset) => {
  const networkConfig = getCardanoNetworkConfigById(defaultAsset.networkId)
  const fakeAmount = new BigNumber('0') // amount doesn't matter for calculating min UTXO amount
  const fakeMultitoken = new MultiToken(
    [
      {
        identifier: defaultAsset.identifier,
        networkId: defaultAsset.networkId,
        amount: fakeAmount,
      },
      {
        identifier: selectedToken.identifier,
        networkId: selectedToken.networkId,
        amount: fakeAmount,
      },
    ],
    {
      defaultNetworkId: defaultAsset.networkId,
      defaultIdentifier: defaultAsset.identifier,
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
  utxos: Array<RawUtxo>,
  address: string,
  amount: string,
  sendAll: boolean,
  defaultAsset: DefaultAsset,
  selectedToken: Token,
  serverTime?: Date | null,
) => {
  const defaultTokenEntry = {
    defaultNetworkId: defaultAsset.networkId,
    defaultIdentifier: defaultAsset.identifier,
  }
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
      token: defaultAsset,
      amount: await getMinAda(selectedToken, defaultAsset),
    })
  }
  return await walletManager.createUnsignedTx(utxos, address, sendTokenList as any, defaultTokenEntry, serverTime)
}

export const recomputeAll = async ({
  amount,
  addressInput,
  utxos,
  sendAll,
  defaultAsset,
  selectedTokenInfo,
  tokenBalance,
  walletMetadata,
}: {
  addressInput: string
  walletMetadata: WalletMeta
  amount: string
  utxos: Array<RawUtxo> | undefined | null
  sendAll: boolean
  defaultAsset: DefaultAsset
  selectedTokenInfo: Token
  tokenBalance: MultiToken
}) => {
  let addressErrors: AddressValidationErrors = {}
  let address = addressInput
  const {networkId} = walletMetadata
  let amountErrors = validateAmount(amount, selectedTokenInfo)

  if (isDomain(addressInput)) {
    try {
      address = await getUnstoppableDomainAddress(addressInput)
    } catch (e) {
      addressErrors = JSON.parse((e as Error).message)
    }
  }

  if (_.isEmpty(addressErrors)) {
    addressErrors = (await isReceiverAddressValid(address, networkId)) || Object.freeze({})
  }

  let balanceErrors = Object.freeze({})
  let fee: BigNumber | null = null
  let balanceAfter: null | BigNumber = null
  let recomputedAmount = amount

  let unsignedTx: HaskellShelleyTxSignRequest | null = null

  if (_.isEmpty(addressErrors) && utxos) {
    try {
      let _fee: MultiToken | null = null

      // we'll substract minAda from ADA balance if we are sending a token
      const minAda =
        !selectedTokenInfo.isDefault && isHaskellShelleyNetwork(selectedTokenInfo.networkId)
          ? new BigNumber(await getMinAda(selectedTokenInfo, defaultAsset))
          : new BigNumber('0')

      if (sendAll) {
        unsignedTx = await getTransactionData(utxos, address, amount, sendAll, defaultAsset, selectedTokenInfo)
        _fee = await unsignedTx.fee()

        if (selectedTokenInfo.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            tokenBalance.getDefault().minus(_fee.getDefault()),
            selectedTokenInfo,
          ).toString()
          balanceAfter = new BigNumber('0')
        } else {
          const selectedTokenBalance = tokenBalance.get(selectedTokenInfo.identifier)
          if (selectedTokenBalance == null) {
            throw new Error('selectedTokenBalance is null, shouldnt happen')
          }
          recomputedAmount = normalizeTokenAmount(selectedTokenBalance, selectedTokenInfo).toString()
          balanceAfter = tokenBalance.getDefault().minus(_fee.getDefault()).minus(minAda)
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedTokenInfo.isDefault
          ? parseAmountDecimal(amount, selectedTokenInfo)
          : new BigNumber('0')
        unsignedTx = await getTransactionData(utxos, address, amount, false, defaultAsset, selectedTokenInfo)
        _fee = await unsignedTx.fee()
        balanceAfter = tokenBalance.getDefault().minus(parsedAmount).minus(minAda).minus(_fee.getDefault())
      }
      // now we can update fee as well
      fee = _fee != null ? _fee.getDefault() : null
    } catch (err) {
      if (err instanceof InsufficientFunds || err instanceof AssetOverflowError || err instanceof InvalidAssetAmount) {
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
    unsignedTx,
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
