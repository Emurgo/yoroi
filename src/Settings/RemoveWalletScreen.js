import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {updateWallets} from '../../legacy/actions'
import styles from '../../legacy/components/Settings/styles/RemoveWalletScreen.style'
import {Button, Checkbox, Spacer, StatusBar, Text, TextInput} from '../../legacy/components/UiKit'
import {Checkmark} from '../../legacy/components/UiKit/TextInput'
import walletManager from '../../legacy/crypto/walletManager'
import {WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {isHWSelector, walletNameSelector} from '../../legacy/selectors'

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

export const RemoveWalletScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const walletName = useSelector(walletNameSelector)
  const isHW = useSelector(isHWSelector)

  const dispatch = useDispatch()
  const [pending, setPending] = React.useState(false)
  const handleRemoveWallet = async () => {
    setPending(true)
    navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
    await walletManager.removeCurrentWallet()
    dispatch(updateWallets())
  }
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = pending || (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type={'dark'} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Description>
          {!isHW && <Text style={styles.description}>{intl.formatMessage(messages.descriptionParagraph1)}</Text>}
          <Text style={styles.description}>{intl.formatMessage(messages.descriptionParagraph2)}</Text>
        </Description>

        <Spacer height={32} />

        <WalletInfo>
          <Text style={styles.walletNameLabel}>{intl.formatMessage(messages.walletName)}</Text>
          <Spacer height={8} />
          <Text style={styles.walletName}>{walletName}</Text>

          <Spacer height={24} />

          <WalletNameInput
            label={intl.formatMessage(messages.walletNameInput)}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
            right={typedWalletName === walletName ? <Checkmark /> : undefined}
            errorText={
              typedWalletName !== walletName ? intl.formatMessage(messages.walletNameMismatchError) : undefined
            }
          />
        </WalletInfo>
      </ScrollView>

      <Actions>
        {!isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={intl.formatMessage(messages.hasWrittenDownMnemonic)}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Spacer height={16} />

        <Button
          onPress={handleRemoveWallet}
          title={intl.formatMessage(messages.remove)}
          style={styles.removeButton}
          disabled={disabled}
        />
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
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType={'done'} />
}
const Actions = (props) => {
  return <View {...props} style={styles.actions} />
}
