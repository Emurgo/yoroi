import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import {Space, SpaceHeight} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

export const RemoveWalletScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const navigation = useNavigation()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()

  const [walletName, setWalletName] = React.useState('')
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] =
    React.useState(false)

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
          <Description>
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
            <Space.Height.xl />

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
          </Description>
          <Space.Height._2xl />

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

            <SpaceHeight size={10} />

            <Text style={a.body_1_lg_regular}>{meta.name}</Text>

            <Space.Height.xl />

            <WalletNameInput
              autoFocus
              enablesReturnKeyAutomatically
              returnKeyType="done"
              placeholder={strings.settings.removeWallet.walletNameInput}
              value={walletName}
              onChangeText={setWalletName}
              style={[a.body_1_lg_regular]}
              errorText={
                walletName !== '' && walletName !== meta.name
                  ? strings.settings.removeWallet.walletNameMismatchError
                  : undefined
              }
            />
          </WalletInfo>
        </ScrollView>

        <Space.Height.lg />

        <View style={[a.p_lg]}>
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
        </View>
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

const WalletNameInput = TextInput
const Actions = (props: ViewProps) => {
  return <View {...props} style={a.py_lg} />
}
