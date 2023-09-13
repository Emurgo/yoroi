import React from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {debugWalletInfo, features} from '../../../../features'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {useStrings} from '../../common/strings'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  datum: {data: string}
  onSuccess: () => void
  onCancel?: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, unsignedTx, datum}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const strings = useStrings()

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  return (
    <>
      <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.spendingPassword}
        value={spendingPassword}
        onChangeText={setSpendingPassword}
        autoComplete="off"
      />

      <Spacer fill />

      <Button
        testID="swapButton"
        shelleyTheme
        title={strings.sign}
        onPress={() => {
          console.log('ConfirmTxWithPassword DATUM', datum)
          return signAndSubmitTx({unsignedTx, password: spendingPassword, datum})
        }}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
  },
  loading: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
