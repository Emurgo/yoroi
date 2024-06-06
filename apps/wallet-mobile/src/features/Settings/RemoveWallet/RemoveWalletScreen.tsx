import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {
  Button,
  Checkbox,
  Checkmark,
  KeyboardAvoidingView,
  Spacer,
  Text,
  TextInput,
  TextInputProps,
} from '../../../components'
import {useWalletNavigation} from '../../../kernel/navigation'
import {useSelectedWalletMeta} from '../../WalletManager/common/hooks/useSelectedWalletMeta'
import {useSelectedWallet} from '../../WalletManager/context/SelectedWalletContext'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {resetToWalletSetupInit, resetToWalletSelection} = useWalletNavigation()
  const {walletManager} = useWalletManager()
  const meta = useSelectedWalletMeta()

  const handleOnRemoveWallet = React.useCallback(() => {
    if (walletManager.walletMetas.size === 1) {
      resetToWalletSetupInit()
    } else {
      resetToWalletSelection()
    }
    InteractionManager.runAfterInteractions(() => walletManager.removeWallet(meta.id))
  }, [meta.id, resetToWalletSelection, resetToWalletSetupInit, walletManager])

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = (!wallet.isHW && !hasMnemonicWrittenDown) || meta.name !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoider}>
        <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
          <Description>
            {!wallet.isHW && <Text style={styles.description}>{strings.descriptionParagraph1}</Text>}

            <Spacer height={24} />

            <Text style={styles.description}>{strings.descriptionParagraph2}</Text>
          </Description>

          <Spacer height={32} />

          <WalletInfo>
            <Text style={styles.walletNameLabel}>{strings.walletName}</Text>

            <Spacer height={10} />

            <Text style={styles.walletName}>{meta.name}</Text>

            <Spacer height={24} />

            <WalletNameInput
              value={typedWalletName}
              onChangeText={setTypedWalletName}
              right={typedWalletName === meta.name ? <Checkmark /> : undefined}
              errorText={typedWalletName !== meta.name ? strings.walletNameMismatchError : undefined}
            />
          </WalletInfo>
        </ScrollView>

        <Spacer fill />

        <Actions>
          {!wallet.isHW && (
            <Checkbox
              checked={hasMnemonicWrittenDown}
              text={strings.hasWrittenDownMnemonic}
              onChange={setHasMnemonicWrittenDown}
            />
          )}

          <Spacer height={30} />

          <Button
            onPress={handleOnRemoveWallet}
            title={strings.remove}
            style={styles.removeButton}
            disabled={disabled}
          />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType="done" />
}
const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage: '!!!If you wish to permanently delete the wallet make sure you have written down the mnemonic.',
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
    walletNameMismatchError: intl.formatMessage(messages.walletNameMismatchError),
    remove: intl.formatMessage(messages.remove),
    hasWrittenDownMnemonic: intl.formatMessage(messages.hasWrittenDownMnemonic),
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
    descriptionContainer: {
      backgroundColor: color.gray_cmin,
    },
    description: {
      ...atoms.body_1_lg_regular,
    },

    walletNameLabel: {
      ...atoms.body_1_lg_medium,
    },
    walletName: {
      ...atoms.body_1_lg_regular,
    },
    actions: {
      ...atoms.p_lg,
    },
    keyboardAvoider: {
      flex: 1,
    },
    removeButton: {
      backgroundColor: color.sys_magenta_c500,
    },
  })
  return styles
}
