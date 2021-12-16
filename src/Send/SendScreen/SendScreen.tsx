/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNum, min_ada_required} from '@emurgo/react-native-haskell-shelley'
import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import React from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {ActivityIndicator, Image, ScrollView, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {fetchUTXOs} from '../../../legacy/actions/utxo'
import type {RawUtxo} from '../../../legacy/api/types'
import DangerousActionModal from '../../../legacy/components/Common/DangerousActionModal'
import AmountField from '../../../legacy/components/Send/AmountField'
import UtxoAutoRefresher from '../../../legacy/components/Send/UtxoAutoRefresher'
import {
  Banner,
  Button,
  Checkbox,
  OfflineBanner,
  Spacer,
  StatusBar,
  Text,
  TextInput,
} from '../../../legacy/components/UiKit'
import {CONFIG} from '../../../legacy/config/config'
import {getCardanoNetworkConfigById, isHaskellShelleyNetwork} from '../../../legacy/config/networks'
import {AssetOverflowError, InsufficientFunds} from '../../../legacy/crypto/errors'
import type {TokenEntry} from '../../../legacy/crypto/MultiToken'
import {MultiToken} from '../../../legacy/crypto/MultiToken'
import type {CreateUnsignedTxResponse} from '../../../legacy/crypto/shelley/transactionUtils'
import {cardanoValueFromMultiToken} from '../../../legacy/crypto/shelley/utils'
import walletManager from '../../../legacy/crypto/walletManager'
import globalMessages, {confirmationMessages} from '../../../legacy/i18n/global-messages'
import {SEND_ROUTES} from '../../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
  lastUtxosFetchErrorSelector,
  tokenBalanceSelector,
  tokenInfoSelector,
  utxosSelector,
  walletMetaSelector,
} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {
  formatTokenAmount,
  formatTokenInteger,
  formatTokenWithSymbol,
  formatTokenWithText,
  getAssetDenominationOrId,
  normalizeTokenAmount,
  truncateWithEllipsis,
} from '../../../legacy/utils/format'
import {InvalidAssetAmount, parseAmountDecimal} from '../../../legacy/utils/parsing'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../../legacy/utils/validators'
import {getUnstoppableDomainAddress, isReceiverAddressValid, validateAmount} from '../../../legacy/utils/validators'
import {DefaultAsset, SendTokenList, Token} from '../../types/cardano'

type Props = {
  selectedTokenIdentifier: string
  sendAll: boolean
  onSendAll: (sendAll: boolean) => void
}
export const SendScreen = ({selectedTokenIdentifier, sendAll, onSendAll}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const lastFetchingError = useSelector(lastUtxosFetchErrorSelector)
  const tokenMetadata = useSelector(tokenInfoSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const utxos = useSelector(utxosSelector)
  const hasPendingOutgoingTransaction = useSelector(hasPendingOutgoingTransactionSelector)
  const isOnline = useSelector(isOnlineSelector)
  const walletMetadata = useSelector(walletMetaSelector)
  const selectedAsset = tokenBalance.values.find(({identifier}) => identifier === selectedTokenIdentifier)

  if (!selectedAsset) {
    throw new Error('Invalid token')
  }

  const [address, setAddress] = React.useState('')
  const [addressInput, setAddressInput] = React.useState('')
  const [addressErrors, setAddressErrors] = React.useState<AddressValidationErrors>({addressIsRequired: true})
  const [amount, setAmount] = React.useState('')
  const [amountErrors, setAmountErrors] = React.useState<AmountValidationErrors>({amountIsRequired: true})
  const [balanceErrors, setBalanceErrors] = React.useState<BalanceValidationErrors>({})
  const [balanceAfter, setBalanceAfter] = React.useState<BigNumber | null>(null)
  const [unsignedTx, setUnsignedTx] = React.useState<CreateUnsignedTxResponse>(null)
  const [fee, setFee] = React.useState<MultiToken | null>(null)
  const [recomputing, setRecomputing] = React.useState(false)
  const [showSendAllWarning, setShowSendAllWarning] = React.useState(false)

  const selectedAssetMeta = tokenMetadata[selectedAsset.identifier]
  const assetDenomination = truncateWithEllipsis(getAssetDenominationOrId(selectedAssetMeta), 20)
  const amountErrorText = getAmountErrorText(intl, amountErrors, balanceErrors, defaultAsset)
  const isValid =
    isOnline &&
    !hasPendingOutgoingTransaction &&
    !isFetchingBalance &&
    !lastFetchingError &&
    utxos &&
    _.isEmpty(addressErrors) &&
    _.isEmpty(amountErrors) &&
    _.isEmpty(balanceErrors)

  React.useEffect(() => {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      if (!__DEV__) throw new Error('using debug data in non-dev env')
      setAddressInput(CONFIG.DEBUG.SEND_ADDRESS)
      setAmount(CONFIG.DEBUG.SEND_AMOUNT)
    }
    navigation.setParams({onScanAddress: setAddressInput})
    navigation.setParams({onScanAmount: setAmount})
  }, [navigation])

  const promiseRef = React.useRef<undefined | Promise<unknown>>()
  React.useEffect(() => {
    setFee(null)
    setBalanceAfter(null)
    setRecomputing(true)

    if (tokenMetadata[selectedAsset.identifier] == null) {
      throw new Error('revalidate: no asset metadata found for the asset selected')
    }

    const promise = recomputeAll({
      utxos,
      addressInput,
      amount,
      sendAll,
      defaultAsset,
      selectedTokenMeta: tokenMetadata[selectedAsset.identifier],
      tokenBalance,
      walletMetadata,
    })

    promiseRef.current = promise

    promise.then((newState) => {
      if (promise !== promiseRef.current) return // abort if newer promise

      setAddress(newState.address)
      setAddressErrors(newState.addressErrors)
      setAmount(newState.amount)
      setAmountErrors(newState.amountErrors)
      setBalanceErrors(newState.balanceErrors)
      setFee(newState.fee)
      setBalanceAfter(newState.balanceAfter)
      setUnsignedTx(newState.unsignedTx)
      setRecomputing(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressInput, amount, sendAll, selectedTokenIdentifier])

  const onContinue = () => {
    if (sendAll) {
      setShowSendAllWarning(true)
      return
    }

    onConfirm()
  }

  const onConfirm = async () => {
    if (!isValid || recomputing || !unsignedTx) return

    const selectedTokenMeta = tokenMetadata[selectedAsset.identifier]
    const defaultAssetAmount = selectedTokenMeta.isDefault
      ? parseAmountDecimal(amount, selectedTokenMeta)
      : // note: inside this if balanceAfter shouldn't be null
        tokenBalance.getDefault().minus(balanceAfter ?? 0)

    const tokens: Array<TokenEntry> = await (async () => {
      if (sendAll) {
        return (await unsignedTx.totalOutput()).nonDefaultEntries()
      }
      if (!selectedTokenMeta.isDefault) {
        return [
          {
            identifier: selectedTokenMeta.identifier,
            networkId: selectedTokenMeta.networkId,
            amount: parseAmountDecimal(amount, selectedTokenMeta),
          },
        ]
      }
      return []
    })()

    setShowSendAllWarning(false)

    navigation.navigate(SEND_ROUTES.CONFIRM, {
      availableAmount: tokenBalance.getDefault(),
      address,
      defaultAssetAmount,
      unsignedTx,
      balanceAfterTx: balanceAfter,
      utxos,
      fee,
      tokens,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <StatusBar type="dark" />

      <UtxoAutoRefresher />
      <ErrorBanners />
      <AvailableAmountBanner />

      <ScrollView style={styles.content} keyboardDismissMode="on-drag">
        <BalanceAfterTransaction
          balanceAfter={balanceAfter}
          tokenMetadata={tokenMetadata}
          tokenBalance={tokenBalance}
        />

        <Fee fee={fee} defaultAsset={defaultAsset} />

        <Spacer height={16} />

        <TextInput
          value={addressInput || ''}
          multiline
          errorOnMount
          onChangeText={setAddressInput}
          label={strings.addressInputLabel}
          errorText={getAddressErrorText(intl, addressErrors)}
        />

        {!recomputing &&
          isDomain(addressInput) &&
          !hasDomainErrors(addressErrors) &&
          !addressInput.includes(address) /* HACK */ && (
            <Text ellipsizeMode="middle" numberOfLines={1}>
              {`Resolves to: ${address}`}
            </Text>
          )}

        <AmountField amount={amount} setAmount={setAmount} error={amountErrorText} editable={!sendAll} />

        <TouchableOpacity onPress={() => navigation.navigate('select-asset')}>
          <TextInput
            right={<Image source={require('../../../legacy/assets/img/arrow_down_fill.png')} />}
            editable={false}
            label={strings.asset}
            value={`${assetDenomination}: ${formatTokenAmount(selectedAsset.amount, selectedAssetMeta, 15)}`}
          />
        </TouchableOpacity>

        <Checkbox
          checked={sendAll}
          onChange={onSendAll}
          text={
            selectedAssetMeta.isDefault
              ? strings.checkboxSendAllAssets
              : strings.checkboxSendAll({assetId: assetDenomination})
          }
        />

        {recomputing && <Indicator />}
      </ScrollView>

      <View style={styles.actions}>
        <Button onPress={onContinue} title={strings.continueButton} disabled={!isValid || fee == null} />
      </View>

      <SendAllWarning
        showSendAllWarning={showSendAllWarning}
        setShowSendAllWarning={setShowSendAllWarning}
        selectedAsset={selectedAsset}
        onConfirm={onConfirm}
      />
    </SafeAreaView>
  )
}

const getMinAda = async (selectedToken: Token, defaultAsset: DefaultAsset) => {
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
  const minAmount = await min_ada_required(
    await cardanoValueFromMultiToken(fakeMultitoken),
    await BigNum.from_str(networkConfig.MINIMUM_UTXO_VAL),
  )
  // if the user is sending a token, we need to make sure the resulting utxo
  // has at least the minimum amount of ADA in it
  return minAmount.to_str()
}

const getTransactionData = async (
  utxos: Array<RawUtxo>,
  address: string,
  amount: string,
  sendAll: boolean,
  defaultAsset: DefaultAsset,
  selectedToken: Token,
  serverTime: Date | void,
): Promise<CreateUnsignedTxResponse> => {
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
  return await walletManager.createUnsignedTx(utxos, address, sendTokenList, defaultTokenEntry, serverTime)
}

const recomputeAll = async ({
  amount,
  addressInput,
  utxos,
  sendAll,
  defaultAsset,
  selectedTokenMeta,
  tokenBalance,
  walletMetadata,
}) => {
  let addressErrors: Record<string, boolean> = {}
  let address = addressInput
  const {networkId} = walletMetadata
  let amountErrors = validateAmount(amount, selectedTokenMeta)

  if (addressInput !== undefined && isDomain(addressInput)) {
    try {
      address = await getUnstoppableDomainAddress(addressInput)
    } catch (e) {
      addressErrors = JSON.parse((e as any).message)
    }
  }

  if (_.isEmpty(addressErrors)) {
    addressErrors = (await isReceiverAddressValid(address, networkId)) || Object.freeze({})
  }

  let balanceErrors = Object.freeze({})
  let fee = null
  let balanceAfter: null | BigNumber = null
  let recomputedAmount = amount

  let unsignedTx: CreateUnsignedTxResponse

  if (_.isEmpty(addressErrors) && utxos) {
    try {
      let _fee: MultiToken | null | undefined

      // we'll substract minAda from ADA balance if we are sending a token
      const minAda =
        !selectedTokenMeta.isDefault && isHaskellShelleyNetwork(selectedTokenMeta.networkId)
          ? new BigNumber(await getMinAda(selectedTokenMeta, defaultAsset))
          : new BigNumber('0')

      if (sendAll) {
        unsignedTx = await getTransactionData(utxos, address, amount, sendAll, defaultAsset, selectedTokenMeta)
        _fee = await unsignedTx.fee()

        if (selectedTokenMeta.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            tokenBalance.getDefault().minus(_fee.getDefault()),
            selectedTokenMeta,
          ).toString()
          balanceAfter = new BigNumber('0')
        } else {
          const selectedTokenBalance = tokenBalance.get(selectedTokenMeta.identifier)
          if (selectedTokenBalance == null) {
            throw new Error('selectedTokenBalance is null, shouldnt happen')
          }
          recomputedAmount = normalizeTokenAmount(selectedTokenBalance, selectedTokenMeta).toString()
          balanceAfter = tokenBalance.getDefault().minus(_fee.getDefault()).minus(minAda)
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedTokenMeta.isDefault
          ? parseAmountDecimal(amount, selectedTokenMeta)
          : new BigNumber('0')
        unsignedTx = await getTransactionData(utxos, address, amount, false, defaultAsset, selectedTokenMeta)
        _fee = await unsignedTx.fee()
        balanceAfter = tokenBalance.getDefault().minus(parsedAmount).minus(minAda).minus(_fee.getDefault())
      }
      // now we can update fee as well
      fee = _fee != null ? _fee.getDefault() : null
    } catch (err) {
      if (err instanceof InsufficientFunds) {
        balanceErrors = {insufficientBalance: true}
      } else if (err instanceof AssetOverflowError) {
        balanceErrors = {assetOverflow: true}
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

const getAddressErrorText = (
  intl: IntlShape,
  addressErrors: {unsupportedDomain: any; recordNotFound: any; unregisteredDomain: any; invalidAddress: boolean},
) => {
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

const getAmountErrorText = (
  intl: IntlShape,
  amountErrors: {invalidAmount: string | number | null},
  balanceErrors: {insufficientBalance: boolean; assetOverflow: boolean},
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    padding: 16,
  },
  actions: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  indicator: {
    marginTop: 26,
  },
  info: {
    fontSize: 14,
    lineHeight: 22,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    balanceAfterNotAvailable: intl.formatMessage(messages.balanceAfterNotAvailable),
    balanceAfterLabel: intl.formatMessage(messages.balanceAfterLabel),
    feeNotAvailable: intl.formatMessage(messages.feeNotAvailable),
    feeLabel: intl.formatMessage(messages.feeLabel),
    addressInputLabel: intl.formatMessage(messages.addressInputLabel),
    asset: intl.formatMessage(messages.asset),
    checkboxSendAllAssets: intl.formatMessage(messages.checkboxSendAllAssets),
    checkboxSendAll: (options) => intl.formatMessage(messages.checkboxSendAll, options),
    continueButton: intl.formatMessage(messages.continueButton),
    errorBannerNetworkError: intl.formatMessage(messages.errorBannerNetworkError),
    errorBannerPendingOutgoingTransaction: intl.formatMessage(messages.errorBannerPendingOutgoingTransaction),
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    availableFundsBannerIsFetching: intl.formatMessage(messages.availableFundsBannerIsFetching),
    availableFundsBannerNotAvailable: intl.formatMessage(messages.availableFundsBannerNotAvailable),
    sendAllWarningAlert1: (options) => intl.formatMessage(messages.sendAllWarningAlert1, options),
    sendAllWarningAlert2: intl.formatMessage(messages.sendAllWarningAlert2),
    sendAllWarningAlert3: intl.formatMessage(messages.sendAllWarningAlert3),
    sendAllWarningTitle: intl.formatMessage(messages.sendAllWarningTitle),
    backButton: intl.formatMessage(confirmationMessages.commonButtons.backButton),
    sendAllContinueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
    sendAllWarningText: intl.formatMessage(messages.sendAllWarningText),
  }
}

const isDomain = (addressInput: string) => /.+\..+/.test(addressInput)
const hasDomainErrors = (addressErrors: AddressValidationErrors) =>
  addressErrors.unsupportedDomain || addressErrors.recordNotFound || addressErrors.unregisteredDomain

const Indicator = () => (
  <View style={styles.indicator}>
    <ActivityIndicator size="large" />
  </View>
)

const BalanceAfterTransaction = ({
  balanceAfter,
  tokenMetadata,
  tokenBalance,
}: {
  balanceAfter: null | BigNumber
  tokenMetadata: Record<string, Token>
  tokenBalance: MultiToken
}) => {
  const strings = useStrings()
  const assetMetaData = tokenMetadata[tokenBalance.getDefaultId()]

  const value = balanceAfter ? formatTokenWithSymbol(balanceAfter, assetMetaData) : strings.balanceAfterNotAvailable

  return <Text style={styles.info}>{`${strings.balanceAfterLabel}: ${value}`}</Text>
}

const Fee = ({fee, defaultAsset}: {fee: null | BigNumber; defaultAsset: DefaultAsset}) => {
  const strings = useStrings()
  const value = fee ? formatTokenWithSymbol(fee, defaultAsset) : strings.feeNotAvailable

  return <Text style={styles.info}>{`${strings.feeLabel}: ${value}`}</Text>
}

const ErrorBanners = () => {
  const strings = useStrings()
  const isOnline = useSelector(isOnlineSelector)
  const hasPendingOutgoingTransaction = useSelector(hasPendingOutgoingTransactionSelector)
  const lastFetchingError = useSelector(lastUtxosFetchErrorSelector)
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const dispatch = useDispatch()

  if (!isOnline) {
    return <OfflineBanner />
  } else if (lastFetchingError && !isFetchingBalance) {
    return <Banner error onPress={() => dispatch(fetchUTXOs())} text={strings.errorBannerNetworkError} />
  } else if (hasPendingOutgoingTransaction) {
    return <Banner error text={strings.errorBannerPendingOutgoingTransaction} />
  } else {
    return null
  }
}

const AvailableAmountBanner = () => {
  const strings = useStrings()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const tokenMetadata = useSelector(tokenInfoSelector)
  const assetMetaData = tokenMetadata[tokenBalance.getDefaultId()]

  return (
    <Banner
      label={strings.availableFunds}
      text={
        isFetchingBalance
          ? strings.availableFundsBannerIsFetching
          : tokenBalance
          ? formatTokenWithText(tokenBalance.getDefault(), assetMetaData)
          : strings.availableFundsBannerNotAvailable
      }
      boldText
    />
  )
}

const SendAllWarning = ({
  selectedAsset,
  showSendAllWarning,
  setShowSendAllWarning,
  onConfirm,
}: {
  selectedAsset: TokenEntry
  showSendAllWarning: boolean
  setShowSendAllWarning: (showSendAllWarning: boolean) => void
  onConfirm: () => void
}) => {
  const strings = useStrings()
  const tokenMetadata = useSelector(tokenInfoSelector)
  const selectedTokenMeta = tokenMetadata[selectedAsset.identifier]
  const isDefault = selectedTokenMeta.isDefault
  const assetNameOrId = truncateWithEllipsis(getAssetDenominationOrId(selectedTokenMeta), 20)
  const alertBoxContent = {
    content: isDefault
      ? [strings.sendAllWarningAlert1({assetNameOrId}), strings.sendAllWarningAlert2, strings.sendAllWarningAlert3]
      : [strings.sendAllWarningAlert1({assetNameOrId})],
  }
  return (
    <DangerousActionModal
      visible={showSendAllWarning}
      onRequestClose={() => setShowSendAllWarning(false)}
      showCloseIcon
      title={strings.sendAllWarningTitle}
      primaryButton={{
        label: strings.backButton,
        onPress: () => setShowSendAllWarning(false),
      }}
      secondaryButton={{
        label: strings.sendAllContinueButton,
        onPress: onConfirm,
      }}
      alertBox={alertBoxContent}
    >
      <Text>{strings.sendAllWarningText}</Text>
    </DangerousActionModal>
  )
}

const amountInputErrorMessages = defineMessages({
  INVALID_AMOUNT: {
    id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
    defaultMessage: '!!!Please enter valid amount',
  },
  TOO_MANY_DECIMAL_PLACES: {
    id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
    defaultMessage: '!!!Please enter valid amount',
  },
  TOO_LARGE: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
    defaultMessage: '!!!Amount too large',
  },
  TOO_LOW: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
    defaultMessage: '!!!Amount is too low',
  },
  LT_MIN_UTXO: {
    id: 'components.send.sendscreen.amountInput.error.LT_MIN_UTXO',
    defaultMessage: '!!!Cannot send less than {minUtxo} {ticker}',
  },
  NEGATIVE: {
    id: 'components.send.sendscreen.amountInput.error.NEGATIVE',
    defaultMessage: '!!!Amount must be positive',
  },
  insufficientBalance: {
    id: 'components.send.sendscreen.amountInput.error.insufficientBalance',
    defaultMessage: '!!!Not enough money to make this transaction',
  },
  assetOverflow: {
    id: 'components.send.sendscreen.amountInput.error.assetOverflow',
    defaultMessage: '!!!!Maximum value of a token inside a UTXO exceeded (overflow).',
  },
})

const messages = defineMessages({
  feeLabel: {
    id: 'components.send.sendscreen.feeLabel',
    defaultMessage: '!!!Fee',
  },
  feeNotAvailable: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!-',
  },
  balanceAfterLabel: {
    id: 'global.txLabels.balanceAfterTx',
    defaultMessage: '!!!Balance after',
  },
  balanceAfterNotAvailable: {
    id: 'components.send.sendscreen.balanceAfterNotAvailable',
    defaultMessage: '!!!-',
  },
  availableFundsBannerIsFetching: {
    id: 'components.send.sendscreen.availableFundsBannerIsFetching',
    defaultMessage: '!!!Checking balance...',
  },
  availableFundsBannerNotAvailable: {
    id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
    defaultMessage: '!!!-',
  },
  addressInputErrorInvalidAddress: {
    id: 'components.send.sendscreen.addressInputErrorInvalidAddress',
    defaultMessage: '!!!Please enter valid address',
  },
  addressInputLabel: {
    id: 'components.send.confirmscreen.receiver',
    defaultMessage: '!!!Address',
  },
  checkboxSendAllAssets: {
    id: 'components.send.sendscreen.checkboxSendAllAssets',
    defaultMessage: '!!!Send all assets (including all tokens)',
  },
  checkboxSendAll: {
    id: 'components.send.sendscreen.checkboxSendAll',
    defaultMessage: '!!!Send all {assetId}',
  },
  domainNotRegisteredError: {
    id: 'components.send.sendscreen.domainNotRegisteredError',
    defaultMessage: '!!!Domain is not registered',
    description: 'some desc',
  },
  domainRecordNotFoundError: {
    id: 'components.send.sendscreen.domainRecordNotFoundError',
    defaultMessage: '!!!No Cardano record found for this domain',
    description: 'some desc',
  },
  domainUnsupportedError: {
    id: 'components.send.sendscreen.domainUnsupportedError',
    defaultMessage: '!!!Domain is not supported',
    description: 'some desc',
  },
  sendAllWarningTitle: {
    id: 'components.send.sendscreen.sendAllWarningTitle',
    defaultMessage: '!!!Do you really want to send all?',
  },
  sendAllWarningText: {
    id: 'components.send.sendscreen.sendAllWarningText',
    defaultMessage:
      '!!!You have selected the send all option. Please confirm that you understand how this feature works.',
  },
  sendAllWarningAlert1: {
    id: 'components.send.sendscreen.sendAllWarningAlert1',
    defaultMessage: '!!!All you {assetNameOrId} balance will be transferred in this transaction.',
  },
  sendAllWarningAlert2: {
    id: 'components.send.sendscreen.sendAllWarningAlert2',
    defaultMessage:
      '!!!All your tokens, including NFTs and any other native ' +
      'assets in your wallet, will also be transferred in this transaction.',
  },
  sendAllWarningAlert3: {
    id: 'components.send.sendscreen.sendAllWarningAlert3',
    defaultMessage: '!!!After you confirm the transaction in the next screen, your wallet will be emptied.',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!We are experiencing issues with fetching your current balance. Click to retry.',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage: '!!!You cannot send a new transaction while an existing one is still pending',
  },
  asset: {
    id: 'global.assets.assetLabel',
    defaultMessage: '!!!Asset',
  },
})
