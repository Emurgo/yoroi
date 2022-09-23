import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {TwoActionView} from '../../../components'
import {useSignAndSubmitTx} from '../../../hooks'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithOS = ({wallet, unsignedTx, onSuccess, onCancel}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation()

  const {signAndSubmitTx, isLoading} = useSignAndSubmitTx(
    {wallet},
    {
      signTx: {useErrorBoundary: true},
      submitTx: {onSuccess, useErrorBoundary: true},
    },
  )

  return (
    <>
      <TwoActionView
        title={strings.confirmTx}
        primaryButton={{
          disabled: isLoading,
          label: strings.confirmButton,
          onPress: () =>
            navigation.navigate('biometrics', {
              keyId: wallet.id,
              onSuccess: (rootKey) => {
                return signAndSubmitTx({unsignedTx, rootKey})
              },
              onFail: () => navigation.goBack(),
            }),
        }}
        secondaryButton={{
          disabled: isLoading,
          onPress: () => onCancel(),
        }}
      >
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />
      </TwoActionView>

      <LoadingOverlay loading={isLoading} />
    </>
  )
}

const LoadingOverlay = ({loading}: {loading: boolean}) => {
  return loading ? (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, {opacity: 0.5, backgroundColor: 'pink'}]} />

      <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
        <ActivityIndicator animating size="large" color="black" />
      </View>
    </View>
  ) : null
}

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}
