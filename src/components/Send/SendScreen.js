// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, TouchableOpacity} from 'react-native'
import _ from 'lodash'

import {CONFIG} from '../../config'
import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button, OfflineBanner, ValidatedTextInput} from '../UiKit'
import {
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  utxoBalanceSelector,
  utxosSelector,
  isOnlineSelector,
  hasPendingOutgoingTransactionSelector,
  getUtxoBalance,
} from '../../selectors'
import {Logger} from '../../utils/logging'
import {
  withTranslations,
  withNavigationTitle,
  throttleProps,
} from '../../utils/renderUtils'
import {formatAda} from '../../utils/format'
import {parseAdaDecimal} from '../../utils/parsing'
import walletManager from '../../crypto/wallet'
import {validateAmount, validateAddressAsync} from '../../utils/validators'
import AmountField from './AmountField'
import UtxoAutoRefresher from './UtxoAutoRefresher'
import {InsufficientFunds} from '../../crypto/errors'
import WarningBanner from './WarningBanner'
import assert from '../../utils/assert'

import styles from './styles/SendScreen.style'

import type {Navigation} from '../../types/navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {RawUtxo} from '../../types/HistoryTransaction'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../utils/validators'

const getTranslations = (state) => state.trans.SendAdaScreen

const getTransactionData = (utxos, address, amount) => {
  const adaAmount = parseAdaDecimal(amount)
  return walletManager.prepareTransaction(utxos, address, adaAmount)
}

const tryCalculateFeeAsync = async ({
  utxos,
  address,
  amount,
}): Promise<{
  fee?: BigNumber,
  balanceAfter?: BigNumber,
  errors: BalanceValidationErrors,
}> => {
  const wrongInputResult = {errors: {}}

  if (!utxos) {
    return wrongInputResult
  }

  const addressError = await validateAddressAsync(address)
  const amountError = validateAmount(amount)

  if (!_.isEmpty({...addressError, ...amountError})) {
    return wrongInputResult
  }

  try {
    const parsedAmount = parseAdaDecimal(amount)
    const {fee} = await getTransactionData(utxos, address, amount)
    const balanceAfter = getUtxoBalance(utxos)
      .minus(parsedAmount)
      .minus(fee)
    return {errors: {}, fee, balanceAfter}
  } catch (err) {
    if (err instanceof InsufficientFunds) {
      return {errors: {insufficientBalance: true}}
    } else {
      // TODO: we should show notification based on error type
      Logger.error('Failed while preparing transaction', err)
    }
  }

  return wrongInputResult
}

const hasValidationErrorsAsync = async ({amount, address, utxos}) => {
  const errors = await Promise.all([
    validateAmount(amount),
    validateAddressAsync(address),
    tryCalculateFeeAsync({utxos, address, amount}).then(({errors}) => errors),
  ])

  return errors.some((e) => !_.isEmpty(e))
}

const AvailableAmount = withTranslations(getTranslations)(
  ({translations, isFetching, hasError, amount}) => (
    <Text>
      {translations.availableAmount.label}{' '}
      {isFetching
        ? translations.availableAmount.isFetching
        : hasError
          ? translations.availableAmount.hasError
          : (amount && formatAda(amount)) || ''}
    </Text>
  ),
)

const ThrottledText = throttleProps(300, {trailing: true})(Text)

const getAmountErrorText = (translations, amountErrors, balanceErrors) => {
  if (amountErrors.invalidAmount != null) {
    return translations.amountInput.errors.invalidAmount[
      amountErrors.invalidAmount
    ]
  }
  if (balanceErrors.insufficientBalance) {
    return translations.amountInput.errors.insufficientBalance
  }
  return null
}

type Props = {
  navigation: Navigation,
  translations: SubTranslation<typeof getTranslations>,
  availableAmount: BigNumber,
  isFetchingBalance: boolean,
  lastFetchingError: any,
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
  isCalculatingFee: boolean,
  fee: ?BigNumber,
  balanceAfter: ?BigNumber,
}

class SendScreen extends Component<Props, State> {
  state = {
    address: '',
    addressErrors: {addressIsRequired: true},
    amount: '',
    amountErrors: {amountIsRequired: true},
    fee: null,
    balanceAfter: null,
    balanceErrors: {},
    isCalculatingFee: false,
  }

  componentDidMount() {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      this.handleAddressChange(CONFIG.DEBUG.SEND_ADDRESS)
      this.handleAmountChange(CONFIG.DEBUG.SEND_AMOUNT)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const utxos = this.props.utxos
    const {address, amount} = this.state

    const prevUtxos = prevProps.utxos
    const {address: prevAddress, amount: prevAmount} = prevState

    if (amount !== prevAmount) {
      this.handleValidateAmount(amount)
    }
    if (address !== prevAddress) {
      this.handleValidateAddressAsync(address)
    }
    if (
      amount !== prevAmount ||
      address !== prevAddress ||
      utxos !== prevUtxos
    ) {
      this.handleValidateFeeAsync({address, amount, utxos})
    }
  }

  handleValidateAmount = (amount) => {
    const amountErrors = validateAmount(amount)

    assert.assert(
      this.state.amount === amount,
      'Amount should not have changed synchronously',
    )
    this.setState({amountErrors})
  }

  handleValidateAddressAsync = async (address) => {
    const addressErrors = await validateAddressAsync(address)

    if (this.state.address !== address) {
      return
    }

    this.setState({addressErrors})
  }

  handleValidateFeeAsync = async ({address, amount, utxos}) => {
    this.setState({fee: null, balanceAfter: null, isCalculatingFee: true})

    const {
      errors: balanceErrors,
      fee,
      balanceAfter,
    } = await tryCalculateFeeAsync({
      utxos,
      address,
      amount,
    })

    if (
      this.state.address !== address ||
      this.state.amount !== amount ||
      this.props.utxos !== utxos
    ) {
      return
    }

    this.setState((prevState) => ({
      balanceErrors,
      isCalculatingFee: false,
      fee,
      balanceAfter,
    }))
  }

  handleAddressChange: (string) => void
  handleAddressChange = (address) => this.setState({address})

  handleAmountChange: (string) => void
  handleAmountChange = (amount) => this.setState({amount})

  handleConfirm: () => Promise<void>
  handleConfirm = async () => {
    const {navigation, utxos, availableAmount} = this.props
    const {address, amount} = this.state

    const hasValidationErrors = await hasValidationErrorsAsync({
      amount,
      address,
      utxos,
    })

    const isValid =
      !hasValidationErrors &&
      this.state.amount === amount &&
      this.state.address === address &&
      this.props.utxos === utxos

    if (isValid && utxos) {
      const adaAmount = parseAdaDecimal(amount)
      const transactionData = await getTransactionData(utxos, address, amount)

      const balanceAfterTx = availableAmount
        .minus(adaAmount)
        .minus(transactionData.fee)

      navigation.navigate(SEND_ROUTES.CONFIRM, {
        address,
        amount: adaAmount,
        transactionData,
        balanceAfterTx,
      })
    }
  }

  navigateToQRReader: () => void
  navigateToQRReader = () => {
    this.props.navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR, {
      onSuccess: (address) => {
        this.handleAddressChange(address)
        this.props.navigation.navigate(SEND_ROUTES.MAIN)
      },
    })
  }

  renderBalanceAfterTransaction = () => {
    const {balanceAfter, isCalculatingFee} = this.state
    const {translations} = this.props

    let value = ''
    if (isCalculatingFee) {
      value = translations.balanceAfter.isCalculating
    } else if (!balanceAfter) {
      value = translations.balanceAfter.notAvailable
    } else {
      value = formatAda(balanceAfter)
    }

    return (
      <ThrottledText>
        {translations.balanceAfter.label}
        {': '}
        {value}
      </ThrottledText>
    )
  }

  renderFee = () => {
    const {isCalculatingFee, fee} = this.state
    const {translations} = this.props

    let value = ''
    if (isCalculatingFee) {
      value = translations.fee.isCalculating
    } else if (!fee) {
      value = translations.fee.notAvailable
    } else {
      value = formatAda(fee)
    }

    return (
      <ThrottledText>
        {translations.fee.label}
        {': '}
        {value}
      </ThrottledText>
    )
  }

  renderErrorBanners = () => {
    const {
      translations,
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
        <WarningBanner
          text={translations.errorBanners.networkError}
          action={fetchUTXOs}
        />
      )
    } else if (hasPendingOutgoingTransaction) {
      return (
        <WarningBanner
          text={translations.errorBanners.pendingOutgoingTransaction}
        />
      )
    } else {
      return null
    }
  }

  render() {
    const {
      translations,
      availableAmount,
      isFetchingBalance,
      lastFetchingError,
      isOnline,
      hasPendingOutgoingTransaction,
    } = this.props

    const {
      address,
      amount,
      amountErrors,
      addressErrors,
      balanceErrors,
    } = this.state

    const disabled =
      isFetchingBalance ||
      lastFetchingError ||
      !_.isEmpty({
        ...addressErrors,
        ...amountErrors,
        ...balanceErrors,
      }) ||
      !isOnline ||
      hasPendingOutgoingTransaction

    return (
      <View style={styles.root}>
        <UtxoAutoRefresher />
        {this.renderErrorBanners()}

        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <AvailableAmount
              isFetching={isFetchingBalance}
              hasError={lastFetchingError}
              amount={availableAmount}
            />
          </View>

          {this.renderBalanceAfterTransaction()}
          {this.renderFee()}

          <View style={styles.containerQR}>
            <TouchableOpacity onPress={this.navigateToQRReader}>
              <View style={styles.scanIcon} />
            </TouchableOpacity>
            <Text style={styles.label}>{translations.scanCode}</Text>
          </View>

          <View style={styles.inputContainer}>
            <ValidatedTextInput
              value={address}
              label={translations.addressInput.label}
              onChangeText={this.handleAddressChange}
              error={
                addressErrors.invalidAddress &&
                translations.addressInput.errors.invalidAddress
              }
            />
            <AmountField
              amount={amount}
              setAmount={this.handleAmountChange}
              error={getAmountErrorText(
                translations,
                amountErrors,
                balanceErrors,
              )}
            />
          </View>

          <Button
            onPress={this.handleConfirm}
            title={translations.continueButton}
            disabled={disabled}
          />
        </ScrollView>
      </View>
    )
  }
}

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      availableAmount: utxoBalanceSelector(state),
      isFetchingBalance: isFetchingUtxosSelector(state),
      lastFetchingError: lastUtxosFetchErrorSelector(state),
      utxos: utxosSelector(state),
      hasPendingOutgoingTransaction: hasPendingOutgoingTransactionSelector(
        state,
      ),
      isOnline: isOnlineSelector(state),
    }),
    null,
  ),
  withNavigationTitle(({translations}) => translations.title),
)(SendScreen)
