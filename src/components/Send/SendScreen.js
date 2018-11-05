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
import {printAda} from '../../utils/transactions'
import WalletManager from '../../crypto/wallet'
import {fetchUTXOs} from '../../actions/utxo'

import styles from './styles/SendScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SendScreen

const handleConfirm = ({navigation, amount, address, utxos}) => async () => {
  // Validate here
  const isValid = true

  if (isValid && utxos) {
    const adaAmount = new BigNumber(amount, 10).times(1000000)
    const transactionData = await WalletManager.prepareTransaction(
      address,
      adaAmount,
      utxos,
    )

    navigation.navigate(SEND_ROUTES.CONFIRM, {
      address,
      amount: adaAmount,
      transactionData,
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

const FetchingErrorBanner = () => (
  <Text>We are experiencing issue with fetching your current balance.</Text>
)

const AvailableAmount = ({translations, value}) => (
  <Text>
    {translations.availableAmount}: {value ? printAda(value) : ''}
  </Text>
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
  fetchUTXOs: () => void,
}

const SendScreen = ({
  navigateToQRReader,
  translations,
  amount,
  address,
  setAmount,
  setAddress,
  handleConfirm,
  availableAmount,
  isFetchingBalance,
  lastFetchingError,
  fetchUTXOs,
}: Props) => (
  <View style={styles.root}>
    <NavigationEvents onWillFocus={fetchUTXOs} />
    {lastFetchingError && <FetchingErrorBanner />}
    <View style={styles.header}>
      {isFetchingBalance ? (
        <Text>{translations.checkingBalance}</Text>
      ) : (
        <AvailableAmount translations={translations} value={availableAmount} />
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
      />
      <TextInput
        style={styles.inputText}
        keyboardType={'numeric'}
        value={amount}
        placeholder={translations.amount}
        onChangeText={setAmount}
      />
    </View>

    <Button onPress={handleConfirm} title={translations.continue} />
  </View>
)

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
  withHandlers({
    navigateToQRReader: ({navigation, setAddress}) => (event) =>
      _navigateToQRReader(navigation, setAddress),
    handleConfirm,
  }),
)(SendScreen)
