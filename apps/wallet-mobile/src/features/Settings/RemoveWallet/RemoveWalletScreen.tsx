import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {
  Button,
  Checkbox,
  Checkmark,
  KeyboardAvoidingView,
  Spacer,
  StatusBar,
  Text,
  TextInput,
  TextInputProps,
} from '../../../components'
import {useWalletNavigation} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {useRemoveWallet, useWalletName} from '../../../yoroi-wallets/hooks'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)

  const {resetToWalletSelection} = useWalletNavigation()
  const {removeWallet, isLoading} = useRemoveWallet(wallet.id, {
    onSuccess: () => resetToWalletSelection(),
  })

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = isLoading || (!wallet.isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="dark" />

      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
          <Description>
            {!wallet.isHW && <Text style={styles.description}>{strings.descriptionParagraph1}</Text>}

            <Spacer height={24} />

            <Text style={styles.description}>{strings.descriptionParagraph2}</Text>
          </Description>

          <Spacer height={32} />

          <WalletInfo>
            <Text style={styles.walletNameLabel}>{strings.walletName}</Text>

            <Spacer height={10} />

            <Text style={styles.walletName}>{walletName}</Text>

            <Spacer height={24} />

            <WalletNameInput
              value={typedWalletName}
              onChangeText={setTypedWalletName}
              right={typedWalletName === walletName ? <Checkmark /> : undefined}
              errorText={typedWalletName !== walletName ? strings.walletNameMismatchError : undefined}
            />
          </WalletInfo>
        </ScrollView>

        <Actions>
          {!wallet.isHW && (
            <Checkbox
              checked={hasMnemonicWrittenDown}
              text={strings.hasWrittenDownMnemonic}
              onChange={setHasMnemonicWrittenDown}
            />
          )}

          <Spacer height={30} />

          <View style={styles.buttonContainer}>
            <Button
              onPress={() => removeWallet()}
              title={strings.remove}
              style={styles.removeButton}
              disabled={disabled}
              block
            />
          </View>
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Description = (props: ViewProps) => {
  return <View {...props} />
}
const WalletInfo = (props: ViewProps) => {
  return <View {...props} style={styles.descriptionContainer} />
}
const WalletNameInput = (props: TextInputProps) => {
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType="done" />
}
const Actions = (props: ViewProps) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  descriptionContainer: {
    backgroundColor: COLORS.BACKGROUND,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },

  walletNameLabel: {
    fontSize: 16,
    fontFamily: 'Rubik',
    fontWeight: '500',
  },
  walletName: {
    fontSize: 16,
  },

  contentContainer: {
    padding: 16,
  },

  actions: {
    padding: 16,
  },
  removeButton: {
    backgroundColor: COLORS.RED,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
})
