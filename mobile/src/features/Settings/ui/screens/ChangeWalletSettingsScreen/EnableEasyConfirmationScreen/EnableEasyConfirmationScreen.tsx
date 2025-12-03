import {isEmptyString} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromise} from '~/common/hooks/usePromise'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

export const EnableEasyConfirmationScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigation = useNavigation()
  const [rootPassword, setRootPassword] = React.useState('')
  const {
    wallet,
    meta: {isHW, isReadOnly},
  } = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const intl = useIntl()
  const {authSetting, canAuthWithHost} = useAuth()

  const cantEnable =
    authSetting === 'pin' || isHW || isReadOnly || !canAuthWithHost

  const promise = React.useCallback(
    (password: string) =>
      walletManager.enableEasyConfirmation(wallet, password),
    [walletManager, wallet],
  )

  const {resolve: enableEasyConfirmation, isPending} = usePromise({
    promise,
    onSuccess: () => {
      navigation.goBack()
    },
    onError: (error) => {
      if (error instanceof App.Errors.WrongPassword) {
        showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        logger.error('Failed to enable easy confirmation', {
          origin: 'EnableEasyConfirmationScreen',
          error,
        })
      }
    },
    onSettled: () => {
      setRootPassword('')
    },
  })

  const handleOnConfirm = () => {
    logger.log('handleOnConfirm', {rootPassword})
    enableEasyConfirmation(rootPassword)
  }

  return (
    <KeyboardAvoidingView style={a.flex_1} enabled>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[ta.bg_color_max, a.flex_1, a.py_lg]}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={[a.px_lg, a.gap_lg]}
        >
          <Text style={a.body_1_lg_regular}>
            {strings.settings.easyConfirmation.enableHeading}
          </Text>

          <Text
            style={[
              {
                color: p.sys_magenta_500,
              },
              a.body_2_md_regular,
            ]}
          >
            {strings.settings.easyConfirmation.enableWarning}
          </Text>

          <PasswordInput
            autoFocus
            enablesReturnKeyAutomatically
            returnKeyType="done"
            secureTextEntry
            label={strings.settings.easyConfirmation.enableRootPassword}
            onChangeText={setRootPassword}
            value={rootPassword}
            autoComplete="off"
          />
        </ScrollView>

        <Actions>
          <Button
            title={strings.settings.easyConfirmation.enableButton}
            onPress={handleOnConfirm}
            disabled={isEmptyString(rootPassword) || isPending || cantEnable}
          />
        </Actions>
      </SafeAreaView>

      <LoadingOverlay isLoading={isPending} />
    </KeyboardAvoidingView>
  )
}

const PasswordInput = TextInput
const Actions = ({children}: ViewProps) => {
  return <View style={[a.pt_lg, a.px_lg]}>{children}</View>
}
