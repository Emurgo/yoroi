import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '~/components/Button/Button'
import {Checkbox} from '~/components/Checkbox/Checkbox'
import {KeyboardAvoidingView} from '~/components/KeyboardAvoidingView/KeyboardAvoidingView'
import {Spacer} from '~/components/Spacer/Spacer'
import {Text} from '~/components/Text'
import {
  Checkmark,
  TextInput,
  TextInputProps,
} from '~/components/TextInput/TextInput'
import {useWalletNavigation} from '~/kernel/navigation'
import {useSelectedWallet} from '~/../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '~/../../../WalletManager/context/WalletManagerProvider'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {resetToWalletSetupInit, resetToWalletSelection} = useWalletNavigation()
  const {walletManager} = useWalletManager()
  const {meta} = useSelectedWallet()

  const handleOnRemoveWallet = React.useCallback(() => {
    if (walletManager.walletMetas.size === 1) {
      resetToWalletSetupInit()
    } else {
      resetToWalletSelection()
    }
    InteractionManager.runAfterInteractions(() =>
      walletManager.removeWallet(meta.id),
    )
  }, [meta.id, resetToWalletSelection, resetToWalletSetupInit, walletManager])

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] =
    React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled =
    (!meta.isHW && !hasMnemonicWrittenDown) || meta.name !== typedWalletName

  return (
    <KeyboardAvoidingView
      style={[{backgroundColor: p.bg_color_max}, a.flex_1, a.px_lg, a.pt_lg]}
    >
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[a.flex_1]}>
        <ScrollView bounces={false}>
          <Description>
            {!meta.isHW && (
              <Text style={[a.body_1_lg_regular]}>
                {strings.descriptionParagraph1}
              </Text>
            )}

            <Spacer height={24} />

            <Text style={[a.body_1_lg_regular]}>
              {strings.descriptionParagraph2}
            </Text>
          </Description>

          <Spacer height={32} />

          <WalletInfo>
            <Text style={[a.body_1_lg_medium]}>{strings.walletName}</Text>

            <Spacer height={10} />

            <Text style={[a.body_1_lg_regular]}>{meta.name}</Text>

            <Spacer height={24} />

            <WalletNameInput
              placeholder={strings.walletName}
              value={typedWalletName}
              onChangeText={setTypedWalletName}
              right={typedWalletName === meta.name ? <Checkmark /> : undefined}
              errorText={
                typedWalletName !== meta.name
                  ? strings.walletNameMismatchError
                  : undefined
              }
            />
          </WalletInfo>
        </ScrollView>

        <Spacer fill />

        {!meta.isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={strings.hasWrittenDownMnemonic}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Actions>
          <Button
            onPress={handleOnRemoveWallet}
            title={strings.remove}
            style={[{backgroundColor: p.sys_magenta_500}]}
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
  const {atoms: ta, palette: p} = useTheme()
  return <View {...props} style={[{backgroundColor: p.bg_color_max}]} />
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
  const {atoms: ta, palette: p} = useTheme()
  return <View {...props} style={[a.py_lg]} />
}

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage:
      '!!!If you wish to permanently delete the wallet make sure you have written down the mnemonic.',
  },
  descriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
    defaultMessage: '!!!To confirm this operation type the wallet name below.',
  },
  walletName: {
    id: 'components.settings.removewalletscreen.walletName',
    defaultMessage: '!!!Wallet name',
  },
  walletNameInput: {
    id: 'components.settings.removewalletscreen.walletNameInput',
    defaultMessage: '!!!Wallet name',
  },
  walletNameMismatchError: {
    id: 'components.settings.removewalletscreen.walletNameMismatchError',
    defaultMessage: '!!!Wallet name does not match',
  },
  remove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: '!!!Remove wallet',
  },
  hasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage:
      '!!!I have written down mnemonic of this wallet and understand that I cannot recover the wallet without it.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    descriptionParagraph1: intl.formatMessage(messages.descriptionParagraph1),
    descriptionParagraph2: intl.formatMessage(messages.descriptionParagraph2),
    walletName: intl.formatMessage(messages.walletName),
    walletNameInput: intl.formatMessage(messages.walletNameInput),
    walletNameMismatchError: intl.formatMessage(
      messages.walletNameMismatchError,
    ),
    remove: intl.formatMessage(messages.remove),
    hasWrittenDownMnemonic: intl.formatMessage(messages.hasWrittenDownMnemonic),
  }
}
