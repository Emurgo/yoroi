// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector, useDispatch} from 'react-redux'
import {View, ScrollView} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Button, Text, Checkbox, TextInput, Spacer, StatusBar} from '../UiKit'
import {Checkmark} from '../UiKit/TextInput'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector, isHWSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/RemoveWalletScreen.style'

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

type Props = {
  intl: IntlShape,
  navigation: any,
}

const RemoveWalletScreen = ({intl, navigation}: Props) => {
  const walletName = useSelector(walletNameSelector)
  const isHW = useSelector(isHWSelector)
  const dispatch = useDispatch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRemoveWallet = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () => async () => {
        await dispatch(removeCurrentWallet())
        navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
      },
      1000,
    )(),
    [],
  )
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

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

export default injectIntl(RemoveWalletScreen)

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
