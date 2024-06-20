import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Text, TextInput} from '../../../components'
import {LoadingOverlay} from '../../../components/LoadingOverlay'
import {showErrorDialog} from '../../../kernel/dialogs'
import {errorMessages} from '../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../kernel/utils'
import {useEnableEasyConfirmation} from '../../Auth/common/useEnableEasyConfirmation'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const EnableEasyConfirmationScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()
  const [rootPassword, setRootPassword] = React.useState('')
  const {
    meta: {id},
  } = useSelectedWallet()
  const {enableEasyConfirmation, isLoading} = useEnableEasyConfirmation(id, {
    onSuccess: () => {
      navigation.goBack()
    },
    onError: (error) => {
      if (!(error instanceof App.Errors.WrongPassword)) throw error
      showErrorDialog(errorMessages.incorrectPassword, intl)
    },
  })

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={styles.contentContainer}>
          <Text style={styles.heading}>{strings.enableHeading}</Text>

          <Text style={styles.warning}>{strings.enableWarning}</Text>

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
            shelleyTheme
          />
        </Actions>
      </KeyboardAvoidingView>

      <LoadingOverlay loading={isLoading} />
    </SafeAreaView>
  )
}

const PasswordInput = TextInput

const Actions = ({children}: ViewProps) => {
  const styles = useStyles()
  return <View style={styles.actions}>{children}</View>
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      padding: 16,
    },
    heading: {
      ...atoms.body_1_lg_regular,
      paddingBottom: 20,
    },
    warning: {
      color: color.sys_magenta_c500,
      ...atoms.body_2_md_regular,
      paddingBottom: 20,
    },
    actions: {
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
  })

  return styles
}
