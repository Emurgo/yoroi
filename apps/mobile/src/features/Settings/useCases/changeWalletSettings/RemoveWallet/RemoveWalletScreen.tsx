import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const RemoveWalletScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const navigation = useNavigation()
  const {wallet} = useSelectedWallet()
  const {walletManager} = useWalletManager()

  const [walletName, setWalletName] = React.useState('')
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] =
    React.useState(false)

  const {meta} = wallet

  const disabled =
    walletName !== meta.name || (!meta.isHW && !hasMnemonicWrittenDown)

  const handleOnRemoveWallet = () => {
    walletManager.removeWallet(wallet.id)
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={[a.flex_1]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={['bottom']} style={[a.flex_1, ta.bg_color_max]}>
        <ScrollView
          style={[a.flex_1]}
          contentContainerStyle={[a.p_lg]}
          keyboardShouldPersistTaps="handled"
        >
          <Space.Height.lg />

          <Text
            style={[
              a.body_1_lg_regular,
              {
                color: p.gray_900,
              },
            ]}
          >
            {strings.settings.removeWallet.descriptionParagraph1}
          </Text>

          <Space.Height.lg />

          <Text
            style={[
              a.body_1_lg_regular,
              {
                color: p.gray_900,
              },
            ]}
          >
            {strings.settings.removeWallet.descriptionParagraph2}
          </Text>

          <Space.Height.lg />

          <WalletInfo style={[a.p_lg, a.gap_md]}>
            <Text
              style={[
                a.body_1_lg_medium,
                {
                  color: p.gray_900,
                },
              ]}
            >
              {strings.settings.removeWallet.walletName}
            </Text>

            <WalletNameInput
              placeholder={strings.settings.removeWallet.walletNameInput}
              value={walletName}
              onChangeText={setWalletName}
              style={[
                a.body_1_lg_regular,
                {
                  color: p.gray_900,
                  borderBottomWidth: 1,
                  borderBottomColor: p.gray_200,
                  paddingVertical: 8,
                },
              ]}
            />

            {walletName !== '' && walletName !== meta.name && (
              <Text
                style={[
                  a.body_3_sm_regular,
                  {
                    color: p.sys_magenta_500,
                  },
                ]}
              >
                {strings.settings.removeWallet.walletNameMismatchError}
              </Text>
            )}
          </WalletInfo>
        </ScrollView>

        <Space.Height.lg fill />

        {!meta.isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={strings.settings.removeWallet.hasWrittenDownMnemonic}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Actions>
          <Button
            onPress={handleOnRemoveWallet}
            title={strings.settings.removeWallet.remove}
            style={{
              backgroundColor: p.sys_magenta_500,
            }}
            disabled={disabled}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Description = (props: ViewProps) => {
  return <View {...props} />
}
const WalletInfo = (props: ViewProps) => {
  const {atoms: ta} = useTheme()
  return <View {...props} style={ta.bg_color_max} />
}
const WalletNameInput = (props: TextInputProps) => {
  return (
    <TextInput
      {...props}
      autoFocus
      enablesReturnKeyAutomatically
      returnKeyType="done"
    />
  )
}
const Actions = (props: ViewProps) => {
  return <View {...props} style={a.py_lg} />
}
