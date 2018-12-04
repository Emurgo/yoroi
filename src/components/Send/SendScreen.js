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
import {withTranslations, withNavigationTitle} from '../../utils/renderUtils'
import {formatAda} from '../../utils/format'
import {parseAdaDecimal} from '../../utils/parsing'
import walletManager from '../../crypto/wallet'
import {validateAmount, validateAddressAsync} from '../../utils/validators'
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
  BalanceValidationErrors,
} from '../../utils/validators'

const getTranslations = (state) => state.trans.SendAdaScreen

const getTransactionData = (utxos, address, amount) => {
  const adaAmount = parseAdaDecimal(amount)
  return walletManager.prepareTransaction(utxos, address, adaAmount)
}

const recomupteAll = async ({amount, address, utxos}) => {
  const amountErrors = validateAmount(amount)
  const addressErrors = await validateAddressAsync(address)
  let balanceErrors = {}
  let fee = null
  let balanceAfter = null

  if (_.isEmpty(addressErrors) && _.isEmpty(amountErrors) && utxos) {
    try {
      const parsedAmount = parseAdaDecimal(amount)
      const {fee: _fee} = await getTransactionData(utxos, address, amount)
      balanceAfter = getUtxoBalance(utxos)
        .minus(parsedAmount)
        .minus(_fee)

      // now we can update fee as well
      fee = _fee
    } catch (err) {
      if (err instanceof InsufficientFunds) {
        balanceErrors = {insufficientBalance: true}
      }
    }
  }
  return {amountErrors, addressErrors, balanceErrors, fee, balanceAfter}
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

    if (
      prevUtxos !== utxos ||
      prevAddress !== address ||
      prevAmount !== amount
    ) {
      this.revalidate({utxos, address, amount})
    }
  }

  async revalidate({utxos, address, amount}) {
    const newState = await recomupteAll({utxos, address, amount})

    if (
      this.state.address !== address ||
      this.state.amount !== amount ||
      this.props.utxos !== utxos
    ) {
      return
    }

    this.setState(newState)
  }

  handleAddressChange: (string) => void
  handleAddressChange = (address) => this.setState({address})

  handleAmountChange: (string) => void
  handleAmountChange = (amount) => this.setState({amount})

  handleConfirm: () => Promise<void>
  handleConfirm = async () => {
    const {navigation, utxos} = this.props
    const {address, amount} = this.state

    const {
      addressErrors,
      amountErrors,
      balanceErrors,
      balanceAfter,
    } = await recomupteAll({
      amount,
      address,
      utxos,
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

    if (isValid) {
      /* :: if (!utxos) throw 'assert' */
      const transactionData = await getTransactionData(utxos, address, amount)

      navigation.navigate(SEND_ROUTES.CONFIRM, {
        address,
        amount: parseAdaDecimal(amount),
        transactionData,
        balanceAfterTx: balanceAfter,
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
    const {balanceAfter} = this.state
    const {translations} = this.props

    const value = balanceAfter
      ? formatAda(balanceAfter)
      : translations.balanceAfter.notAvailable

    return (
      <Text>
        {translations.balanceAfter.label}
        {': '}
        {value}
      </Text>
    )
  }

  renderFee = () => {
    const {fee} = this.state
    const {translations} = this.props

    const value = fee ? formatAda(fee) : translations.fee.notAvailable

    return (
      <Text>
        {translations.fee.label}
        {': '}
        {value}
      </Text>
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
      utxos,
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
            disabled={!isValid}
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
