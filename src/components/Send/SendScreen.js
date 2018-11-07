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

type FormValidationErrors = {
  address: AddressValidationErrors | null,
  amount: AmountValidationErrors | null,
}

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

const canValidateBalance = (utxos, addressErrors, amountErrors) =>
  utxos &&
  !addressErrors &&
  (!amountErrors ||
    amountErrors.invalidAmount === INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE)

const clearBalanceErrors = (amountErrors) => {
  if (
    amountErrors &&
    amountErrors.invalidAmount === INVALID_AMOUNT_CODES.INSUFFICIENT_BALANCE
  ) {
    return null
  } else {
    return amountErrors
  }
}

const handleChangeAddress = ({
  utxos,
  amount,
  validationErrors,
  setAddress,
  setValidationErrors,
}) => async (address) => {
  setAddress(address)

  const amountErrors = clearBalanceErrors(validationErrors.amount)
  const addressErrors = await validateAddressAsync(address)
  const amountOrBalanceErrors = canValidateBalance(
    utxos,
    addressErrors,
    validationErrors.amount,
  )
    ? await validateBalanceAsync(utxos, address, amount)
    : amountErrors

  setValidationErrors({address: addressErrors, amount: amountOrBalanceErrors})
}

const handleChangeAmount = ({
  utxos,
  address,
  validationErrors,
  setAmount,
  setValidationErrors,
}) => async (amount) => {
  setAmount(amount)

  const amountErrors = validateAmount(amount)
  const amountOrBalanceErrors = canValidateBalance(
    utxos,
    validationErrors.address,
    amountErrors,
  )
    ? await validateBalanceAsync(utxos, address, amount)
    : amountErrors

  setValidationErrors({...validationErrors, amount: amountOrBalanceErrors})
}

const handleConfirm = ({
  navigation,
  utxos,
  address,
  amount,
  availableAmount,
  setValidationErrors,
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

    const balanceAfterTx = availableAmount
      .minus(adaAmount)
      .minus(transactionData.fee)

    navigation.navigate(SEND_ROUTES.CONFIRM, {
      address,
      amount: adaAmount,
      transactionData,
      balanceAfterTx,
    })
  } else {
    setValidationErrors({
      address: addressErrors,
      amount: amountErrors || balanceErrors,
    })
  }
}

const _navigateToQRReader = (navigation, setAddress) =>
  navigation.navigate(SEND_ROUTES.ADDRESS_READER_QR, {
    onSuccess: (address) => {
      setAddress(address)
      navigation.navigate(SEND_ROUTES.MAIN)
    },
  })

const handleDidFocus = ({isFetching, fetchUTXOs}) => () => {
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
  handleDidFocus: () => void,
  handleChangeAddress: (string) => mixed,
  handleChangeAmount: (string) => mixed,
  validationErrors: FormValidationErrors,
}

const SendScreen = ({
  navigateToQRReader,
  handleConfirm,
  translations,
  amount,
  address,
  availableAmount,
  isFetchingBalance,
  lastFetchingError,
  handleDidFocus,
  handleChangeAddress,
  handleChangeAmount,
  validationErrors,
}: Props) => {
  const disabled =
    isFetchingBalance ||
    !!lastFetchingError ||
    !!validationErrors.address ||
    !!validationErrors.amount

  return (
    <View style={styles.root}>
      <NavigationEvents onDidFocus={handleDidFocus} />
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
          onChangeText={handleChangeAddress}
        />
        {/* prettier-ignore */ !!validationErrors.address &&
          !!validationErrors.address.invalidAddress && (
          <Text style={styles.error}>
            {translations.validationErrors.invalidAddress}
          </Text>
        )}
        <TextInput
          style={styles.inputText}
          keyboardType={'numeric'}
          value={amount}
          placeholder={translations.amount}
          onChangeText={handleChangeAmount}
        />
        {/* prettier-ignore */ !!validationErrors.amount &&
          !!validationErrors.amount.invalidAmount && (
          <Text style={styles.error}>
            {translations
              .validationErrors
              .amountErrorByErrorCode(validationErrors.amount.invalidAmount)}
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
  withState('validationErrors', 'setValidationErrors', {
    address: {addressIsRequired: true},
    amount: {amountIsRequired: true},
  }),
  withHandlers({
    navigateToQRReader: ({navigation, setAddress}) => (event) =>
      _navigateToQRReader(navigation, setAddress),
    handleConfirm,
    handleDidFocus,
    handleChangeAddress,
    handleChangeAmount,
  }),
)(SendScreen)
