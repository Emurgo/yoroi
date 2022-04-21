import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, View} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {Button, Checkbox, Checkmark, Spacer, StatusBar, Text, TextInput} from '../../components'
import {useRemoveWallet, useWalletName} from '../../hooks'
import {updateWallets} from '../../legacy/actions'
import {isHWSelector} from '../../legacy/selectors'
import {useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const isHW = useSelector(isHWSelector)

  const {resetToWalletSelection} = useWalletNavigation()
  const dispatch = useDispatch()
  const {removeWallet, isLoading} = useRemoveWallet({
    onMutate: () => resetToWalletSelection(),
    onSuccess: () => {
      dispatch(updateWallets())
    },
  })

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = isLoading || (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="dark" />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Description>
          {!isHW && <Text style={styles.description}>{strings.descriptionParagraph1}</Text>}
          <Text style={styles.description}>{strings.descriptionParagraph2}</Text>
        </Description>

        <Spacer height={32} />

        <WalletInfo>
          <Text style={styles.walletNameLabel}>{strings.walletName}</Text>
          <Spacer height={8} />
          <Text style={styles.walletName}>{walletName}</Text>

          <Spacer height={24} />

          <WalletNameInput
            label={strings.walletNameInput}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
            right={typedWalletName === walletName ? <Checkmark /> : undefined}
            errorText={typedWalletName !== walletName ? strings.walletNameMismatchError : undefined}
          />
        </WalletInfo>
      </ScrollView>

      <Actions>
        {!isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={strings.hasWrittenDownMnemonic}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Spacer height={16} />

        <Button onPress={() => removeWallet()} title={strings.remove} style={styles.removeButton} disabled={disabled} />
      </Actions>
    </SafeAreaView>
  )
}

const Description = (props) => {
  return <View {...props} />
}
const WalletInfo = (props) => {
  return <View {...props} style={styles.descriptionContainer} />
}
const WalletNameInput = (props) => {
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType="done" />
}
const Actions = (props) => {
  return <View {...props} style={styles.actions} />
}

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage:
      '!!!If you really wish to permanently delete the wallet make sure you have written down the mnemonic.',
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
    textAlign: 'center',
  },

  walletNameLabel: {
    fontSize: 16,
  },
  walletName: {
    color: COLORS.DISABLED,
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
})
