import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletNavigation} from '../../../../../kernel/navigation/navigation'
import {Button} from '../../../../../ui/Button/Button'
import {Checkbox} from '../../../../../ui/Checkbox/Checkbox'
import {KeyboardAvoidingView} from '../../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {Space, SpaceHeight} from '../../../../../ui/Space/Space'
import {Text} from '../../../../../ui/Text/Text'
import {
  Checkmark,
  TextInput,
  TextInputProps,
} from '../../../../../ui/TextInput/TextInput'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
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
    <KeyboardAvoidingView style={styles.root}>
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={styles.safeAreaView}
      >
        <ScrollView bounces={false}>
          <Description>
            {!meta.isHW && (
              <Text style={styles.description}>
                {strings.descriptionParagraph1}
              </Text>
            )}

            <Space.Height.xl />

            <Text style={styles.description}>
              {strings.descriptionParagraph2}
            </Text>
          </Description>

          <Space.Height.lg />

          <WalletInfo>
            <Text style={styles.walletNameLabel}>{strings.walletName}</Text>

            <SpaceHeight size={10} />

            <Text style={styles.walletName}>{meta.name}</Text>

            <Space.Height.xl />

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

        <SpaceHeight fill size={'lg'} />

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
            style={styles.removeButton}
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
  const styles = useStyles()
  return <View {...props} style={styles.descriptionContainer} />
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
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
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

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: p.bg_color_max,
      ...a.flex_1,
      ...a.px_lg,
      ...a.pt_lg,
    },
    descriptionContainer: {
      backgroundColor: p.bg_color_max,
    },
    description: {
      ...a.body_1_lg_regular,
    },

    walletNameLabel: {
      ...a.body_1_lg_medium,
    },
    walletName: {
      ...a.body_1_lg_regular,
    },
    actions: {
      ...a.py_lg,
    },
    safeAreaView: {
      ...a.flex_1,
    },
    removeButton: {
      backgroundColor: p.sys_magenta_500,
    },
  })
  return styles
}
