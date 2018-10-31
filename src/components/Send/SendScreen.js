// @flow

import React from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TextInput, TouchableOpacity} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button} from '../UiKit'
import {availableAmountSelector} from '../../selectors'
import {printAda} from '../../utils/transactions'
import WalletManager from '../../crypto/wallet'

import styles from './styles/SendScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SendScreen

const handleConfirm = ({navigation, amount, address}) => async () => {
  // Validate here
  const isValid = true

  if (isValid) {
    const adaAmount = new BigNumber(amount, 10).times(1000000)
    const transactionData = await WalletManager.prepareTransaction(
      address,
      adaAmount,
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

type Props = {
  navigateToQRReader: () => mixed,
  handleConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  amount: string,
  address: string,
  availableAmount: number,
  setAmount: () => mixed,
  setAddress: () => mixed,
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
}: Props) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text>Available funds: {printAda(availableAmount)}</Text>
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
  connect((state) => ({
    translations: getTranslations(state),
    availableAmount: availableAmountSelector(state),
  })),
  withState('address', 'setAddress', ''),
  withState('amount', 'setAmount', ''),
  withHandlers({
    navigateToQRReader: ({navigation, setAddress}) => (event) =>
      _navigateToQRReader(navigation, setAddress),
    handleConfirm,
  }),
)(SendScreen)
