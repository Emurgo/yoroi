import {time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {Icon} from '~/ui/Icon'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {useLoadingOverlay} from '~/ui/LoadingOverlay/context'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

export const RemoveWalletScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const navigation = useWalletNavigation()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {show, hide} = useLoadingOverlay()

  const [walletName, setWalletName] = React.useState('')
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] =
    React.useState(false)

  const disabled =
    walletName !== meta.name || (!meta.isHW && !hasMnemonicWrittenDown)

  const handleOnRemoveWallet = () => {
    show()
    // reset nav state to unmount screens
    navigation.resetToWalletSelection()
    // delay the removal of the wallets
    setTimeout(() => {
      walletManager.removeWallet(wallet.id)
    }, time.seconds(1.0))
    setTimeout(() => {
      hide()
    }, time.seconds(1.3))
  }

  const errorText =
    walletName !== '' && walletName !== meta.name
      ? strings.settings.removeWallet.walletNameMismatchError
      : undefined

  const right =
    !errorText && walletName !== '' ? (
      <Icon.Check size={24} color={p.text_success} />
    ) : undefined

  return (
    <KeyboardAvoidingView style={[a.flex_1, ta.bg_color_max]} enabled>
      <SafeAreaView
        style={[a.flex_1, ta.bg_color_max, a.py_lg]}
        edges={['bottom', 'right', 'left']}
      >
        <ScrollView
          style={a.flex_1}
          contentContainerStyle={a.px_lg}
          keyboardShouldPersistTaps="handled"
        >
          <Description>
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {strings.settings.removeWallet.descriptionParagraph1}
            </Text>

            <Space.Height.xl />

            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {strings.settings.removeWallet.descriptionParagraph2}
            </Text>
          </Description>

          <Space.Height._2xl />

          <WalletInfo style={a.gap_sm}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              {strings.settings.removeWallet.walletName}
            </Text>

            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {meta.name}
            </Text>

            <WalletNameInput
              autoFocus
              enablesReturnKeyAutomatically
              returnKeyType="done"
              placeholder={strings.settings.removeWallet.walletNameInput}
              value={walletName}
              onChangeText={setWalletName}
              style={[a.body_1_lg_regular]}
              errorText={errorText}
              right={right}
            />
          </WalletInfo>
        </ScrollView>

        <View style={a.px_lg}>
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
              type={ButtonType.Critical}
              disabled={disabled}
            />
          </Actions>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Description = View
const WalletInfo = View
const WalletNameInput = TextInput
const Actions = (props: ViewProps) => {
  return <View {...props} style={a.pt_lg} />
}
