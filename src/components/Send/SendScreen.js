// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, TextInput, TouchableOpacity} from 'react-native'

import {CONFIG} from '../../config'
import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button, OfflineBanner} from '../UiKit'
import {
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  utxoBalanceSelector,
  utxosSelector,
  isOnlineSelector,
  hasPendingOutgoingTransactionSelector,
} from '../../selectors'
import {Logger} from '../../utils/logging'
import {withTranslations, withNavigationTitle} from '../../utils/renderUtils'
import {formatAda} from '../../utils/format'
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

const getTranslations = (state) => state.trans.Send.Main

const convertToAda = (amount) => new BigNumber(amount, 10).times(1000000)

const getTransactionData = (utxos, address, amount) => {
  const adaAmount = convertToAda(amount)
  return walletManager.prepareTransaction(utxos, address, adaAmount)
}

const validateFeeAsync = async (utxos, address, amount) => {
  if (!utxos) {
    return null
  }

  const addressError = await validateAddressAsync(address)
  const amountError = validateAmount(amount)

  if (addressError || amountError) {
    return null
  }

  try {
    await getTransactionData(utxos, address, amount)
  } catch (err) {
    if (err instanceof InsufficientFunds) {
      return {insufficientBalance: true}
    } else {
      // TODO: we should show notification based on error type
      Logger.error('Failed while preparing transaction', err)
    }
  }

  return null
}

const hasValidationErrorsAsync = async ({amount, address, utxos}) => {
  const errors = await Promise.all([
    validateAmount(amount),
    validateAddressAsync(address),
    validateFeeAsync(utxos, address, amount),
  ])

  return errors.some((e) => !!e)
}

const FetchingErrorBanner = withTranslations(getTranslations)(
  ({translations}) => <Text>{translations.fetchingError}</Text>,
)

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
  amount: string,
  addressErrors: ?AddressValidationErrors,
  amountErrors: ?AmountValidationErrors,
  balanceErrors: ?BalanceValidationErrors,
}

class SendScreen extends Component<Props, State> {
  state = {
    address: '',
    amount: '',
    addressErrors: {addressIsRequired: true},
    amountErrors: {amountIsRequired: true},
    balanceErrors: null,
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
    const balanceErrors = await validateFeeAsync(utxos, address, amount)

    if (
      this.state.address !== address ||
      this.state.amount !== amount ||
      this.props.utxos !== utxos
    ) {
      return
    }

    this.setState({balanceErrors})
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
      const adaAmount = convertToAda(amount)
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

  renderBanners = () => {
    const {
      lastFetchingError,
      hasPendingOutgoingTransaction,
      translations,
      fetchUTXOs,
      isFetchingBalance,
    } = this.props
    if (hasPendingOutgoingTransaction) {
      return (
        <WarningBanner
          text={translations.validationErrors.pendingOutgoingTransaction}
        />
      )
    } else if (lastFetchingError && !isFetchingBalance) {
      return (
        <WarningBanner
          text={translations.validationErrors.serverFailed}
          action={fetchUTXOs}
        />
      )
    }

    return null
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
      !!lastFetchingError ||
      !!addressErrors ||
      !!amountErrors ||
      !!balanceErrors ||
      !isOnline ||
      hasPendingOutgoingTransaction

    return (
      <View style={styles.root}>
        <OfflineBanner />
        <ScrollView style={styles.container}>
          <UtxoAutoRefresher />
          {lastFetchingError && <FetchingErrorBanner />}
          <View style={styles.header}>
            <AvailableAmount
              isFetching={isFetchingBalance}
              hasError={lastFetchingError}
              amount={availableAmount}
            />
          </View>
          <View style={styles.containerQR}>
            <TouchableOpacity onPress={this.navigateToQRReader}>
              <View style={styles.scanIcon} />
            </TouchableOpacity>
            <Text style={styles.label}>{translations.scanCode}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              value={address}
              placeholder={translations.address}
              onChangeText={this.handleAddressChange}
            />
            {/* prettier-ignore */ addressErrors &&
            !!addressErrors.invalidAddress && (
              <Text style={styles.error}>
                {translations.validationErrors.invalidAddress}
              </Text>
            )}
            <AmountField
              style={styles.inputText}
              amount={amount}
              setAmount={this.handleAmountChange}
            />
            {/* prettier-ignore */ amountErrors &&
            amountErrors.invalidAmount && (
              <Text style={styles.error}>
                {translations
                  .validationErrors
                  .invalidAmount}
              </Text>
            )}
            {/* prettier-ignore */ balanceErrors &&
            balanceErrors.insufficientBalance && (
              <Text style={styles.error}>
                {translations
                  .validationErrors
                  .insufficientBalance}
              </Text>
            )}
          </View>

          {this.renderBanners()}

          <Button
            onPress={this.handleConfirm}
            title={translations.continue}
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
