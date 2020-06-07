// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View} from 'react-native'
import _ from 'lodash'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'

import {CONFIG} from '../../config'
import {SEND_ROUTES} from '../../RoutesList'
import {
  Text,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
} from '../UiKit'
import {
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  utxoBalanceSelector,
  utxosSelector,
  isOnlineSelector,
  hasPendingOutgoingTransactionSelector,
  getUtxoBalance,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithText, formatAdaWithSymbol} from '../../utils/format'
import {parseAdaDecimal} from '../../utils/parsing'
import walletManager from '../../crypto/wallet'
import {validateAmount, validateAddressAsync} from '../../utils/validators'
import AmountField from './AmountField'
import UtxoAutoRefresher from './UtxoAutoRefresher'
import {InsufficientFunds} from '../../crypto/errors'

import styles from './styles/SendScreen.style'

import type {Navigation} from '../../types/navigation'
import globalMessages from '../../i18n/global-messages'
import type {RawUtxo} from '../../types/HistoryTransaction'
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

const getTransactionData = (utxos, address, amount) => {
  const adaAmount = parseAdaDecimal(amount)
  return walletManager.prepareTransaction(utxos, address, adaAmount)
}

const recomputeAll = async ({amount, address, utxos}) => {
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

const getAmountErrorText = (intl, amountErrors, balanceErrors) => {
  if (amountErrors.invalidAmount != null) {
    return intl.formatMessage(
      amountInputErrorMessages[amountErrors.invalidAmount],
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
    this.props.navigation.setParams({onScanAddress: this.handleAddressChange})
    this.props.navigation.setParams({onScanAmount: this.handleAmountChange})
  }

  async componentDidUpdate(prevProps, prevState) {
    const utxos = this.props.utxos
    const {address, amount} = this.state

    const prevUtxos = prevProps.utxos
    const {address: prevAddress, amount: prevAmount} = prevState

    if (
      prevUtxos !== utxos ||
      prevAddress !== address ||
      prevAmount !== amount
    ) {
      await this.revalidate({utxos, address, amount})
    }
  }

  async revalidate({utxos, address, amount}) {
    const newState = await recomputeAll({utxos, address, amount})

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
    const {navigation, utxos, availableAmount} = this.props
    const {address, amount} = this.state

    const {
      addressErrors,
      amountErrors,
      balanceErrors,
      balanceAfter,
    } = await recomputeAll({
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

    if (isValid === true) {
      /* :: if (!utxos) throw 'assert' */
      const transactionData = await getTransactionData(utxos, address, amount)

      navigation.navigate(SEND_ROUTES.CONFIRM, {
        availableAmount,
        address,
        amount: parseAdaDecimal(amount),
        transactionData,
        balanceAfterTx: balanceAfter,
        utxos,
      })
    }
  }

  renderBalanceAfterTransaction = () => {
    const {balanceAfter} = this.state
    const {intl} = this.props

    const value = balanceAfter
      ? formatAdaWithSymbol(balanceAfter)
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
    const {intl} = this.props

    const value = fee
      ? formatAdaWithSymbol(fee)
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
    const {isFetchingBalance, availableAmount, intl} = this.props

    return (
      <Banner
        label={intl.formatMessage(globalMessages.availableFunds)}
        text={
          isFetchingBalance
            ? intl.formatMessage(messages.availableFundsBannerIsFetching)
            : availableAmount
              ? formatAdaWithText(availableAmount)
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
            error={getAmountErrorText(intl, amountErrors, balanceErrors)}
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
        availableAmount: utxoBalanceSelector(state),
        isFetchingBalance: isFetchingUtxosSelector(state),
        lastFetchingError: lastUtxosFetchErrorSelector(state),
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
