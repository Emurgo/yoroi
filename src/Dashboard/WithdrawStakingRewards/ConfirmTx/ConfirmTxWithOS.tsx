import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {TwoActionView} from '../../../components'
import {useSignAndSubmitTx} from '../../../hooks'
import {confirmationMessages, errorMessages, txLabels} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../legacy/actions'
import {ensureKeysValidity} from '../../../legacy/deviceSettings'
import {SystemAuthDisabled, walletManager, YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithOS: React.FC<Props> = ({wallet, unsignedTx, onSuccess, onCancel}) => {
  const intl = useIntl()
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
            ensureKeysValidity(wallet.id)
              .then(() =>
                navigation.navigate('biometrics', {
                  keyId: wallet.id,
                  onSuccess: (masterKey) => {
                    return signAndSubmitTx({unsignedTx, masterKey})
                  },
                  onFail: () => navigation.goBack(),
                }),
              )
              .catch(async (error) => {
                if (error instanceof SystemAuthDisabled) {
                  onCancel()
                  await walletManager.closeWallet()
                  await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
                  navigation.navigate('app-root', {screen: 'wallet-selection'})
                }
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

const LoadingOverlay: React.FC<{loading: boolean}> = ({loading}) => {
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
