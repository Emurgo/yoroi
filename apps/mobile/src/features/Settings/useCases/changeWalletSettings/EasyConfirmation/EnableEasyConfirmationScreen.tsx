import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LoadingOverlay} from '../../../../../ui/LoadingOverlay/LoadingOverlay'
import {Text} from '../../../../../ui/Text/Text'
import {TextInput} from '../../../../../ui/TextInput/TextInput'
import {isEmptyString} from '../../../../../wallets/utils/string'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'

export const EnableEasyConfirmationScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigation = useNavigation()
  const [rootPassword, setRootPassword] = React.useState('')
  const {
    meta: {id},
  } = useSelectedWallet()
  const {enableEasyConfirmation, isLoading} = {
    enableEasyConfirmation: () => {},
    isLoading: true,
  }

  return (
    <KeyboardAvoidingView style={a.flex_1}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[ta.bg_color_max, a.flex_1]}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={[a.p_lg, a.gap_lg]}
        >
          <Text style={a.body_1_lg_regular}>{strings.enableHeading}</Text>

          <Text
            style={[
              {
                color: p.sys_magenta_500,
              },
              a.body_2_md_regular,
            ]}
          >
            {strings.enableWarning}
          </Text>

          <PasswordInput
            autoFocus
            enablesReturnKeyAutomatically
            returnKeyType="done"
            secureTextEntry
            label={strings.enableRootPassword}
            onChangeText={setRootPassword}
            value={rootPassword}
            autoComplete="off"
          />
        </ScrollView>

        <Actions>
          <Button
            title={strings.enableButton}
            onPress={() => enableEasyConfirmation(rootPassword)}
            disabled={isEmptyString(rootPassword) || isLoading}
          />
        </Actions>
      </SafeAreaView>

      <LoadingOverlay loading={isLoading} />
    </KeyboardAvoidingView>
  )
}

const PasswordInput = TextInput

const Actions = ({children}: ViewProps) => {
  return <View style={a.p_lg}>{children}</View>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    enableHeading: intl.formatMessage(messages.enableHeading),
    enableWarning: intl.formatMessage(messages.enableWarning),
    enableRootPassword: intl.formatMessage(messages.enableRootPassword),
    enableButton: intl.formatMessage(messages.enableButton),
  }
}

const messages = defineMessages({
  enableHeading: {
    id: 'components.settings.enableeasyconfirmationscreen.enableHeading',
    defaultMessage:
      '!!!This option will allow you to send transactions ' +
      'from your wallet just by confirming with fingerprint or ' +
      'face recognition with standard system fallback option. ' +
      'This makes your wallet less secure. This is a compromise ' +
      'between UX and security!',
  },
  enableWarning: {
    id: 'components.settings.enableeasyconfirmationscreen.enableWarning',
    defaultMessage:
      '!!!Please remember your master password, as you may need it ' +
      'in case your biometrics data are removed from the device.',
  },
  enableRootPassword: {
    id: 'components.settings.enableeasyconfirmationscreen.enableMasterPassword',
    defaultMessage: '!!!Master password',
  },
  enableButton: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable',
  },
})
