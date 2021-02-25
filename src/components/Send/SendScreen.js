// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View} from 'react-native'
import _ from 'lodash'
import SafeAreaView from 'react-native-safe-area-view'
import {injectIntl, defineMessages} from 'react-intl'

import {CONFIG} from '../../config/config'
import {SEND_ROUTES} from '../../RoutesList'
import {
  Text,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
  Checkbox,
} from '../UiKit'
import AssetSelector from '../Common/MultiAsset/AssetSelector'
import {
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  tokenBalanceSelector,
  utxosSelector,
  isOnlineSelector,
  hasPendingOutgoingTransactionSelector,
  getUtxoBalance,
  availableAssetsSelector,
  defaultNetworkAssetSelector,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'
import {withNavigationTitle} from '../../utils/renderUtils'
import {
  formatTokenAmount,
  formatTokenInteger,
  formatTokenWithText,
  formatTokenWithSymbol,
} from '../../utils/format'
import {parseAmountDecimal, InvalidAssetAmount} from '../../utils/parsing'
import walletManager from '../../crypto/walletManager'
import {validateAmount, validateAddressAsync} from '../../utils/validators'
import AmountField from './AmountField'
import UtxoAutoRefresher from './UtxoAutoRefresher'
import {InsufficientFunds} from '../../crypto/errors'
import {MultiToken} from '../../crypto/MultiToken'

import styles from './styles/SendScreen.style'

import type {Navigation} from '../../types/navigation'
import type {Token, DefaultAsset} from '../../types/HistoryTransaction'
import type {TokenEntry} from '../../crypto/MultiToken'
import type {CreateUnsignedTxResponse} from '../../crypto/shelley/transactionUtils'
import globalMessages from '../../i18n/global-messages'
import type {RawUtxo} from '../../api/types'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../utils/validators'
import type {ComponentType} from 'react'

const amountInputErrorMessages = defineMessages({
  INVALID_AMOUNT: {
    id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
    defaultMessage: '!!!Please enter valid amount',
    description: 'some desc',
  },
  TOO_MANY_DECIMAL_PLACES: {
    id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
    defaultMessage: '!!!Please enter valid amount',
    description: 'some desc',
  },
  TOO_LARGE: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
    defaultMessage: '!!!Amount too large',
    description: 'some desc',
  },
  TOO_LOW: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
    defaultMessage: '!!!Amount is too low',
    description: 'some desc',
  },
  LT_MIN_UTXO: {
    id: 'components.send.sendscreen.amountInput.error.LT_MIN_UTXO',
    defaultMessage: '!!!Cannot send less than {minUtxo} {ticker}',
    description: 'some desc',
  },
  NEGATIVE: {
    id: 'components.send.sendscreen.amountInput.error.NEGATIVE',
    defaultMessage: '!!!Amount must be positive',
    description: 'some desc',
  },
  insufficientBalance: {
    id: 'components.send.sendscreen.amountInput.error.insufficientBalance',
    defaultMessage: '!!!Not enough money to make this transaction',
    description: 'some desc',
  },
})

const messages = defineMessages({
  title: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
    description: 'some desc',
  },
  feeLabel: {
    id: 'components.send.sendscreen.feeLabel',
    defaultMessage: '!!!Fee',
    description: 'some desc',
  },
  feeNotAvailable: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  balanceAfterLabel: {
    id: 'components.send.sendscreen.balanceAfterLabel',
    defaultMessage: '!!!Balance after',
    description: 'some desc',
  },
  balanceAfterNotAvailable: {
    id: 'components.send.sendscreen.balanceAfterNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  availableFundsBannerIsFetching: {
    id: 'components.send.sendscreen.availableFundsBannerIsFetching',
    defaultMessage: '!!!Checking balance...',
    description: 'some desc',
  },
  availableFundsBannerNotAvailable: {
    id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  addressInputErrorInvalidAddress: {
    id: 'components.send.sendscreen.addressInputErrorInvalidAddress',
    defaultMessage: '!!!Please enter valid address',
    description: 'some desc',
  },
  addressInputLabel: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Address',
    description: 'some desc',
  },
  checkboxLabel: {
    id: 'components.send.sendscreen.checkboxLabel',
    defaultMessage: '!!!Send full balance',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
    description: 'some desc',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage:
      '!!!We are experiencing issues with fetching your current balance. ' +
      'Click to retry.',
    description: 'some desc',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage:
      'You cannot send a new transaction while ' +
      'an existing one is still pending',
    description: 'some desc',
  },
})

const getTransactionData = async (
  utxos: Array<RawUtxo>,
  address: string,
  amount: string,
  sendAll: boolean,
  defaultAsset: DefaultAsset,
): Promise<CreateUnsignedTxResponse> => {
  const defaultTokenEntry = {
    defaultNetworkId: defaultAsset.networkId,
    defaultIdentifier: defaultAsset.identifier,
  }
  const token = defaultAsset
  if (sendAll) {
    return await walletManager.createUnsignedTx(
      utxos,
      address,
      [
        {
          token,
          shouldSendAll: true,
        },
      ],
      defaultTokenEntry,
    )
  } else {
    const amountBigNum = parseAmountDecimal(amount)
    return await walletManager.createUnsignedTx(
      utxos,
      address,
      [
        {
          token,
          amount: amountBigNum.toString(),
        },
      ],
      defaultTokenEntry,
    )
  }
}

const recomputeAll = async ({
  amount,
  address,
  utxos,
  sendAll,
  defaultAsset,
}) => {
  const amountErrors = validateAmount(amount)
  const addressErrors = await validateAddressAsync(address)
  let balanceErrors = Object.freeze({})
  let fee = null
  let balanceAfter = null
  let recomputedAmount = amount

  if (_.isEmpty(addressErrors) && utxos) {
    try {
      let _fee: ?MultiToken
      if (sendAll) {
        const unsignedTx = await getTransactionData(
          utxos,
          address,
          amount,
          sendAll,
          defaultAsset,
        )
        _fee = await unsignedTx.fee()
        // TODO(multi-asset): format according to asset metadata
        recomputedAmount = getUtxoBalance(utxos)
          .minus(_fee.getDefault())
          .dividedBy(CONFIG.NUMBERS.LOVELACES_PER_ADA) // to ada
          .decimalPlaces(CONFIG.NUMBERS.DECIMAL_PLACES_IN_ADA)
          .toString()
        balanceAfter = new BigNumber('0')
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = parseAmountDecimal(amount)
        const unsignedTx = await getTransactionData(
          utxos,
          address,
          amount,
          false,
          defaultAsset,
        )
        _fee = await unsignedTx.fee()
        balanceAfter = getUtxoBalance(utxos)
          .minus(parsedAmount)
          .minus(_fee.getDefault())
      }
      // now we can update fee as well
      fee = _fee != null ? _fee.getDefault() : null
    } catch (err) {
      if (err instanceof InsufficientFunds) {
        balanceErrors = {insufficientBalance: true}
      }
    }
  }
  return {
    amount: recomputedAmount,
    amountErrors,
    addressErrors,
    balanceErrors,
    fee,
    balanceAfter,
  }
}

const getAmountErrorText = (
  intl,
  amountErrors,
  balanceErrors,
  defaultAsset,
) => {
  if (amountErrors.invalidAmount != null) {
    const msgOptions = {}
    if (
      amountErrors.invalidAmount === InvalidAssetAmount.ERROR_CODES.LT_MIN_UTXO
    ) {
      const amount = new BigNumber(
        CONFIG.NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL,
      )
      // remove decimal part if it's equal to 0
      const decimalPart = amount.modulo(
        Math.pow(10, defaultAsset.metadata.numberOfDecimals),
      )
      const minUtxo = decimalPart.eq('0')
        ? formatTokenInteger(amount, defaultAsset)
        : formatTokenAmount(amount, defaultAsset)
      const ticker = defaultAsset.metadata.ticker
      Object.assign(msgOptions, {minUtxo, ticker})
    }
    return intl.formatMessage(
      amountInputErrorMessages[amountErrors.invalidAmount],
      msgOptions,
    )
  }
  if (balanceErrors.insufficientBalance === true) {
    return intl.formatMessage(amountInputErrorMessages.insufficientBalance)
  }
  return null
}

type Props = {
  navigation: Navigation,
  intl: any,
  tokenBalance: MultiToken,
  isFetchingBalance: boolean,
  lastFetchingError: any,
  availableAssets: Dict<Token>,
  defaultAsset: DefaultAsset,
  utxos: ?Array<RawUtxo>,
  isOnline: boolean,
  hasPendingOutgoingTransaction: boolean,
  fetchUTXOs: () => void,
}

type State = {
  address: string,
  addressErrors: AddressValidationErrors,
  amount: string,
  amountErrors: AmountValidationErrors,
  balanceErrors: BalanceValidationErrors,
  fee: ?BigNumber,
  balanceAfter: ?BigNumber,
  sendAll: boolean,
  selectedAsset: TokenEntry,
}

class SendScreen extends Component<Props, State> {
  state = {
    address: '',
    addressErrors: {addressIsRequired: true},
    amount: '',
    amountErrors: {amountIsRequired: true},
    fee: null,
    balanceAfter: null,
    balanceErrors: Object.freeze({}),
    sendAll: false,
    selectedAsset: this.props.tokenBalance.getDefaultEntry(),
  }

  componentDidMount() {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      if (!__DEV__) throw new Error('using debug data in non-dev env')
      this.handleAddressChange(CONFIG.DEBUG.SEND_ADDRESS)
      this.handleAmountChange(CONFIG.DEBUG.SEND_AMOUNT)
    }
    this.props.navigation.setParams({onScanAddress: this.handleAddressChange})
    this.props.navigation.setParams({onScanAmount: this.handleAmountChange})
  }

  async componentDidUpdate(prevProps, prevState) {
    const utxos = this.props.utxos
    const {address, amount, sendAll} = this.state

    const prevUtxos = prevProps.utxos
    const {
      address: prevAddress,
      amount: prevAmount,
      sendAll: prevSendAll,
    } = prevState

    if (
      prevUtxos !== utxos ||
      prevAddress !== address ||
      prevAmount !== amount ||
      prevSendAll !== sendAll
    ) {
      await this.revalidate({utxos, address, amount, sendAll})
    }
  }

  async revalidate({utxos, address, amount, sendAll}) {
    const {defaultAsset} = this.props
    const newState = await recomputeAll({
      utxos,
      address,
      amount,
      sendAll,
      defaultAsset,
    })

    if (
      this.state.address !== address ||
      this.state.amount !== amount ||
      this.state.sendAll !== sendAll ||
      this.props.utxos !== utxos
    ) {
      return
    }

    this.setState(newState)
  }

  handleAddressChange: (string) => void = (address) => this.setState({address})

  onAssetSelect: (TokenEntry | null) => void = (token) =>
    this.setState({selectedAsset: token})

  handleAmountChange: (string) => void = (amount) => this.setState({amount})

  handleCheckBoxChange: (boolean) => void = (sendAll) =>
    this.setState({sendAll})

  handleConfirm: () => Promise<void> = async () => {
    const {navigation, utxos, tokenBalance, defaultAsset} = this.props
    const {address, amount, sendAll} = this.state

    const {
      addressErrors,
      amountErrors,
      balanceErrors,
      balanceAfter,
    } = await recomputeAll({
      amount,
      address,
      utxos,
      sendAll,
      defaultAsset,
    })

    // Note(ppershing): use this.props as they might have
    // changed during await
    const isValid =
      this.props.isOnline &&
      !this.props.hasPendingOutgoingTransaction &&
      !this.props.isFetchingBalance &&
      utxos &&
      _.isEmpty(addressErrors) &&
      _.isEmpty(amountErrors) &&
      _.isEmpty(balanceErrors) &&
      this.state.amount === amount &&
      this.state.address === address &&
      this.props.utxos === utxos

    if (isValid === true) {
      /* :: if (!utxos) throw 'assert' */
      const transactionData = await getTransactionData(
        utxos,
        address,
        amount,
        sendAll,
        defaultAsset,
      )
      const fee = (await transactionData.fee()).getDefault()

      navigation.navigate(SEND_ROUTES.CONFIRM, {
        availableAmount: tokenBalance.getDefault(),
        address,
        amount: parseAmountDecimal(amount),
        transactionData,
        balanceAfterTx: balanceAfter,
        utxos,
        fee,
      })
    }
  }

  renderBalanceAfterTransaction = () => {
    const {balanceAfter} = this.state
    const {intl, availableAssets, tokenBalance} = this.props
    const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

    const value = balanceAfter
      ? formatTokenWithSymbol(balanceAfter, assetMetaData)
      : intl.formatMessage(messages.balanceAfterNotAvailable)

    return (
      <Text small>
        {intl.formatMessage(messages.balanceAfterLabel)}
        {': '}
        {value}
      </Text>
    )
  }

  renderFee = () => {
    const {fee} = this.state
    const {intl, defaultAsset} = this.props

    const value = fee
      ? formatTokenWithSymbol(fee, defaultAsset)
      : intl.formatMessage(messages.feeNotAvailable)

    return (
      <Text small>
        {intl.formatMessage(messages.feeLabel)}
        {': '}
        {value}
      </Text>
    )
  }

  renderAvailableAmountBanner = () => {
    const {isFetchingBalance, tokenBalance, availableAssets, intl} = this.props
    const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

    return (
      <Banner
        label={intl.formatMessage(globalMessages.availableFunds)}
        text={
          isFetchingBalance
            ? intl.formatMessage(messages.availableFundsBannerIsFetching)
            : tokenBalance
              ? formatTokenWithText(tokenBalance.getDefault(), assetMetaData)
              : intl.formatMessage(messages.availableFundsBannerNotAvailable)
        }
        boldText
      />
    )
  }

  renderErrorBanners = () => {
    const {
      intl,
      isOnline,
      lastFetchingError,
      isFetchingBalance,
      hasPendingOutgoingTransaction,
      fetchUTXOs,
    } = this.props

    if (!isOnline) {
      return <OfflineBanner />
    } else if (lastFetchingError && !isFetchingBalance) {
      return (
        <Banner
          error
          onPress={fetchUTXOs}
          text={intl.formatMessage(messages.errorBannerNetworkError)}
        />
      )
    } else if (hasPendingOutgoingTransaction) {
      return (
        <Banner
          error
          text={intl.formatMessage(
            messages.errorBannerPendingOutgoingTransaction,
          )}
        />
      )
    } else {
      return null
    }
  }

  render() {
    const {
      intl,
      isFetchingBalance,
      lastFetchingError,
      utxos,
      isOnline,
      hasPendingOutgoingTransaction,
      defaultAsset,
      availableAssets,
      tokenBalance,
    } = this.props

    const {
      address,
      amount,
      amountErrors,
      addressErrors,
      balanceErrors,
      sendAll,
    } = this.state

    const isValid =
      isOnline &&
      !hasPendingOutgoingTransaction &&
      !isFetchingBalance &&
      !lastFetchingError &&
      utxos &&
      _.isEmpty({
        ...addressErrors,
        ...amountErrors,
        ...balanceErrors,
      })

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar type="dark" />

        <UtxoAutoRefresher />
        {this.renderErrorBanners()}
        {this.renderAvailableAmountBanner()}

        <ScrollView style={styles.content} keyboardDismissMode="on-drag">
          {this.renderBalanceAfterTransaction()}
          {this.renderFee()}

          <ValidatedTextInput
            multiline
            style={styles.address}
            value={address}
            label={intl.formatMessage(messages.addressInputLabel)}
            onChangeText={this.handleAddressChange}
            blurOnSubmit
            error={
              addressErrors.invalidAddress === true &&
              intl.formatMessage(messages.addressInputErrorInvalidAddress)
            }
          />
          <AmountField
            amount={amount}
            setAmount={this.handleAmountChange}
            error={getAmountErrorText(
              intl,
              amountErrors,
              balanceErrors,
              defaultAsset,
            )}
            editable={!sendAll}
          />
          <Checkbox
            disabled={false}
            checked={sendAll}
            onChange={this.handleCheckBoxChange}
            text={intl.formatMessage(messages.checkboxLabel)}
          />
          <AssetSelector
            onSelect={this.onAssetSelect}
            selectedAsset={this.state.selectedAsset}
            label={'Asset'}
            assets={tokenBalance.values}
            assetsMetadata={availableAssets}
          />
        </ScrollView>
        <View style={styles.actions}>
          <Button
            onPress={this.handleConfirm}
            title={intl.formatMessage(messages.continueButton)}
            disabled={!isValid}
          />
        </View>
      </SafeAreaView>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  intl: any,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        tokenBalance: tokenBalanceSelector(state),
        isFetchingBalance: isFetchingUtxosSelector(state),
        lastFetchingError: lastUtxosFetchErrorSelector(state),
        availableAssets: availableAssetsSelector(state),
        defaultAsset: defaultNetworkAssetSelector(state),
        utxos: utxosSelector(state),
        hasPendingOutgoingTransaction: hasPendingOutgoingTransactionSelector(
          state,
        ),
        isOnline: isOnlineSelector(state),
      }),
      {
        fetchUTXOs,
      },
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(SendScreen): ComponentType<ExternalProps>),
)
