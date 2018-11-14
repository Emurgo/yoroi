// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, TextInput, TouchableOpacity} from 'react-native'

import {CONFIG} from '../../config'
import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button} from '../UiKit'
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
import {
  INVALID_AMOUNT_CODES,
  validateAmount,
  validateAddressAsync,
} from '../../utils/validators'
import AmountField from './AmountField'
import UtxoAutoRefresher from './UtxoAutoRefresher'
import {InsufficientFunds} from '../../crypto/errors'
import WarningBanner from './WarningBanner'

import styles from './styles/SendScreen.style'

import type {Navigation} from '../../types/navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {RawUtxo} from '../../types/HistoryTransaction'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
} from '../../utils/validators'

type FormValidationErrors = {
  address: ?AddressValidationErrors,
  amount: ?AmountValidationErrors,
}

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

  try {
    await getTransactionData(utxos, address, amount)
  } catch (err) {
    if (err instanceof InsufficientFunds) {
      return {invalidAmount: INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE}
    } else {
      // TODO: we should show notification based on error type
      Logger.error('Failed while preparing transaction', err)
    }
  }

  return null
}

const shouldValidateFee = (
  utxos: ?Array<RawUtxo>,
  addressErrors: ?AddressValidationErrors,
  amountErrors: ?AmountValidationErrors,
) =>
  utxos &&
  !addressErrors &&
  (!amountErrors ||
    amountErrors.invalidAmount === INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE)

const clearFeeErrors = (amountErrors) => {
  if (
    amountErrors &&
    amountErrors.invalidAmount === INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE
  ) {
    return null
  } else {
    return amountErrors
  }
}

const validateAsync = async (utxos, address, amount) => {
  const addressErrors = await validateAddressAsync(address)
  const amountErrors = validateAmount(amount)
  const isFormValid = shouldValidateFee(utxos, addressErrors, amountErrors)

  /* prettier-ignore */
  const feeErrors = isFormValid
    ? await validateFeeAsync(utxos, address, amount)
    : null

  return {
    address: addressErrors,
    amount: amountErrors || feeErrors,
  }
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
  validationErrors: FormValidationErrors,
}

class SendScreen extends Component<Props, State> {
  state = {
    address: '',
    amount: '',
    validationErrors: {
      address: {addressIsRequired: true},
      amount: {amountIsRequired: true},
    },
  }

  componentDidMount() {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      this.handleAddressChange(CONFIG.DEBUG.SEND_ADDRESS)
      this.handleAmountChange(CONFIG.DEBUG.SEND_AMOUNT)
    }
  }

  componentDidUpdate(prevProps) {
    const utxos = this.props.utxos
    const {address, amount} = this.state

    if (utxos && address && amount && utxos !== prevProps.utxos) {
      validateAsync(utxos, address, amount).then(this.setValidationErrors)
    }
  }

  setAddress: (string) => void
  setAddress = (address) => {
    this.setState({address})
  }

  setAmount: (string) => void
  setAmount = (amount) => {
    this.setState({amount})
  }

  setValidationErrors: (?FormValidationErrors) => void
  setValidationErrors = (validationErrors) => {
    this.setState({validationErrors})
  }

  handleAddressChange: (string) => Promise<void>
  handleAddressChange = async (address) => {
    const {amount, validationErrors} = this.state
    const utxos = this.props.utxos

    this.setAddress(address)

    const amountErrors = clearFeeErrors(validationErrors.amount)
    const addressErrors = await validateAddressAsync(address)
    const amountOrFeeErrors = shouldValidateFee(
      utxos,
      addressErrors,
      validationErrors.amount,
    )
      ? await validateFeeAsync(utxos, address, amount)
      : amountErrors

    this.setValidationErrors({
      address: addressErrors,
      amount: amountOrFeeErrors,
    })
  }

  handleAmountChange: (string) => Promise<void>
  handleAmountChange = async (amount) => {
    const {address, validationErrors} = this.state
    const utxos = this.props.utxos

    this.setAmount(amount)

    const amountErrors = validateAmount(amount)
    const amountOrFeeErrors = shouldValidateFee(
      utxos,
      validationErrors.address,
      amountErrors,
    )
      ? await validateFeeAsync(utxos, address, amount)
      : amountErrors

    this.setValidationErrors({...validationErrors, amount: amountOrFeeErrors})
  }

  handleConfirm: () => Promise<void>
  handleConfirm = async () => {
    const {navigation, utxos, availableAmount} = this.props
    const {address, amount} = this.state

    const errors = await validateAsync(utxos, address, amount)
    const isValid = !!errors

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

    this.setValidationErrors(errors)
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
    const {address, amount, validationErrors} = this.state
    const {address: addressErrors, amount: amountErrors} = validationErrors

    const disabled =
      isFetchingBalance ||
      !!lastFetchingError ||
      !!addressErrors ||
      !!amountErrors ||
      !isOnline ||
      hasPendingOutgoingTransaction

    return (
      <ScrollView style={styles.root}>
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
            !!amountErrors.invalidAmount && (
            <Text style={styles.error}>
              {translations
                .validationErrors
                .invalidAmountErrors[amountErrors.invalidAmount]}
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
