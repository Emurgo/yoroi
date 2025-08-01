import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useStrings} from '~/kernel/i18n/useStrings'

import {isEmptyString} from '~/wallets/utils/string'
import {Button} from '../../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LoadingOverlay} from '../../../../../ui/LoadingOverlay/LoadingOverlay'
import {Text} from '../../../../../ui/Text/Text'
import {TextInput} from '../../../../../ui/TextInput/TextInput'
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
