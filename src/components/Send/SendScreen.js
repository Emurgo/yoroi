// @flow

import React from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TextInput, TouchableOpacity} from 'react-native'
import {NavigationEvents} from 'react-navigation'
import {withHandlers, withState} from 'recompose'

import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button} from '../UiKit'
import {
  isFetchingBalanceSelector,
  lastFetchingErrorSelector,
  utxoBalanceSelector,
  utxosSelector,
} from '../../selectors'
import {Logger} from '../../utils/logging'
import {printAda, withTranslations} from '../../utils/renderUtils'
import walletManager from '../../crypto/wallet'
import {fetchUTXOs} from '../../actions/utxo'
import {CardanoError} from '../../crypto/util'
import {
  INVALID_AMOUNT_CODES,
  validateAmount,
  validateAddressAsync,
} from '../../utils/validators'

import styles from './styles/SendScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
} from '../../utils/validators'

const getTranslations = (state) => state.trans.SendScreen

const convertToAda = (amount) => new BigNumber(amount, 10).times(1000000)

const getTransactionData = (utxos, address, amount) => {
  const adaAmount = convertToAda(amount)
  return walletManager.prepareTransaction(utxos, address, adaAmount)
}

const validateBalanceAsync = async (utxos, address, amount) => {
  try {
    await getTransactionData(utxos, address, amount)
  } catch (err) {
    // TODO: detect precise error (NotEnoughInput)
    if (err instanceof CardanoError) {
      return {invalidAmount: INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE}
    } else {
      // TODO: we should show notification based on error type
      Logger.error('Failed while preparing transaction', err)
    }
  }

  return null
}

const handleValidateAddress = ({
  utxos,
  address,
  amount,
  amountErrors,
  setAddressErrors,
  setAmountErrors,
}) => async () => {
  const addressErrors = await validateAddressAsync(address)
  setAddressErrors(addressErrors)

  if (
    utxos &&
    !addressErrors &&
    (!amountErrors ||
      amountErrors.invalidAmount === INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE)
  ) {
    const balanceErrors = await validateBalanceAsync(utxos, address, amount)
    setAmountErrors(balanceErrors)
  }
}

const handleValidateAmount = ({
  utxos,
  address,
  amount,
  addressErrors,
  setAmountErrors,
}) => async () => {
  const amountErrors = validateAmount(amount)
  setAmountErrors(amountErrors)

  if (utxos && !addressErrors && !amountErrors) {
    const balanceErrors = await validateBalanceAsync(utxos, address, amount)
    setAmountErrors(balanceErrors)
  }
}

const handleConfirm = ({
  navigation,
  utxos,
  address,
  amount,
  setAddressErrors,
  setAmountErrors,
}) => async () => {
  const addressErrors = await validateAddressAsync(address)
  const amountErrors = validateAmount(amount)
  const isFormValid = !addressErrors && !amountErrors

  /* prettier-ignore */
  const balanceErrors = (isFormValid && !!utxos)
    ? await validateBalanceAsync(utxos, address, amount)
    : null

  const isValid = !!utxos && isFormValid && !balanceErrors

  if (isValid) {
    const adaAmount = convertToAda(amount)
    const transactionData = await getTransactionData(utxos, address, amount)

    navigation.navigate(SEND_ROUTES.CONFIRM, {
      address,
      amount: adaAmount,
      transactionData,
    })
  } else {
    setAddressErrors(addressErrors)
    setAmountErrors(amountErrors || balanceErrors)
  }
}

const _navigateToQRReader = (navigation, setAddress) =>
  navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR, {
    onSuccess: (address) => {
      setAddress(address)
      navigation.navigate(SEND_ROUTES.MAIN)
    },
  })

const handleWillFocus = ({isFetching, fetchUTXOs}) => () => {
  if (!isFetching) {
    fetchUTXOs()
  }
}

const FetchingErrorBanner = withTranslations(getTranslations)(
  ({translations}) => <Text>{translations.fetchingError}</Text>,
)

const AvailableAmount = withTranslations(getTranslations)(
  ({translations, value}) => (
    <Text>
      {translations.availableAmount}: {value ? printAda(value) : ''}
    </Text>
  ),
)

type Props = {
  navigateToQRReader: () => mixed,
  handleConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  amount: string,
  address: string,
  availableAmount: number,
  setAmount: () => mixed,
  setAddress: () => mixed,
  isFetchingBalance: boolean,
  lastFetchingError: any,
  handleWillFocus: () => void,
  handleValidateAddress: () => mixed,
  handleValidateAmount: () => mixed,
  addressErrors?: AddressValidationErrors,
  amountErrors?: AmountValidationErrors,
}

const SendScreen = ({
  navigateToQRReader,
  handleConfirm,
  translations,
  amount,
  address,
  availableAmount,
  setAmount,
  setAddress,
  isFetchingBalance,
  lastFetchingError,
  handleWillFocus,
  handleValidateAddress,
  handleValidateAmount,
  addressErrors,
  amountErrors,
}: Props) => {
  const disabled =
    isFetchingBalance ||
    !!lastFetchingError ||
    !!addressErrors ||
    !!amountErrors

  return (
    <View style={styles.root}>
      <NavigationEvents onWillFocus={handleWillFocus} />
      {lastFetchingError && <FetchingErrorBanner />}
      <View style={styles.header}>
        {isFetchingBalance ? (
          <Text>{translations.checkingBalance}</Text>
        ) : (
          <AvailableAmount value={availableAmount} />
        )}
      </View>
      <View style={styles.containerQR}>
        <TouchableOpacity onPress={navigateToQRReader}>
          <View style={styles.scanIcon} />
        </TouchableOpacity>
        <Text style={styles.label}>{translations.scanCode}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputText}
          value={address}
          placeholder={translations.address}
          onChangeText={setAddress}
          onEndEditing={handleValidateAddress}
        />
        {/* prettier-ignore */ !!addressErrors &&
          addressErrors.invalidAddress && (
          <Text style={styles.error}>
            {translations.validationErrors.invalidAddress}
          </Text>
        )}
        <TextInput
          style={styles.inputText}
          keyboardType={'numeric'}
          value={amount}
          placeholder={translations.amount}
          onChangeText={setAmount}
          onEndEditing={handleValidateAmount}
        />
        {/* prettier-ignore */ !!amountErrors &&
          !!amountErrors.invalidAmount && (
          <Text style={styles.error}>
            {translations
              .validationErrors
              .amountErrorByErrorCode(amountErrors.invalidAmount)}
          </Text>
        )}
      </View>

      <Button
        onPress={handleConfirm}
        title={translations.continue}
        disabled={disabled}
      />
    </View>
  )
}

export default compose(
  /* prettier-ignore */
  connect((state) => ({
    translations: getTranslations(state),
    availableAmount: utxoBalanceSelector(state),
    isFetchingBalance: isFetchingBalanceSelector(state),
    lastFetchingError: lastFetchingErrorSelector(state),
    utxos: utxosSelector(state),
  }), {
    fetchUTXOs,
  }),
  withState('address', 'setAddress', ''),
  withState('amount', 'setAmount', ''),
  withState('addressErrors', 'setAddressErrors', {addressIsRequired: true}),
  withState('amountErrors', 'setAmountErrors', {amountIsRequired: true}),
  withHandlers({
    navigateToQRReader: ({navigation, setAddress}) => (event) =>
      _navigateToQRReader(navigation, setAddress),
    handleConfirm,
    handleValidateAddress,
    handleValidateAmount,
    handleWillFocus,
  }),
)(SendScreen)
