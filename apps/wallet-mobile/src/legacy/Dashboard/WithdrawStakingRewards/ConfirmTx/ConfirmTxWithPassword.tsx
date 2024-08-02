import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, View} from 'react-native'

import {TextInput, TwoActionView} from '../../../../components'
import {debugWalletInfo, features} from '../../../../kernel/features'
import {confirmationMessages, txLabels} from '../../../../kernel/i18n/global-messages'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, onCancel, unsignedTx}: Props) => {
  const strings = useStrings()
  const {color} = useTheme()
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  return (
    <>
      <TwoActionView
        primaryButton={{
          disabled: isLoading,
          label: strings.confirmButton,
          onPress: () => signAndSubmitTx({unsignedTx, password}),
          testID: 'confirmTxButton',
        }}
        secondaryButton={{
          disabled: isLoading,
          onPress: () => onCancel(),
          testID: 'cancelTxButton',
        }}
      >
        <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />

        <PasswordInput
          autoComplete="off"
          autoFocus
          onChangeText={setPassword}
          secureTextEntry
          value={password}
          label={strings.password}
          disabled={isLoading}
          testID="walletPasswordInput"
        />
      </TwoActionView>

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={color.gray_c900} />
        </View>
      )}
    </>
  )
}

const PasswordInput = TextInput

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}
