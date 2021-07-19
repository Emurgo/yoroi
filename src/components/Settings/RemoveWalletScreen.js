// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Button, Text, Checkbox, TextInput, StatusBar} from '../UiKit'
import {Checkmark} from '../UiKit/TextInput'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector, isHWSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/RemoveWalletScreen.style'

import type {State} from '../../state'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage: 'If you really wish to permanently delete the wallet make sure you have written down the mnemonic.',
  },
  descriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
    defaultMessage: '!!!To confirm this operation type the wallet name below.',
  },
  walletName: {
    id: 'components.settings.removewalletscreen.walletName',
    defaultMessage: 'Wallet name',
  },
  walletNameInput: {
    id: 'components.settings.removewalletscreen.walletNameInput',
    defaultMessage: 'Wallet name',
  },
  walletNameMismatchError: {
    id: 'components.settings.removewalletscreen.walletNameMismatchError',
    defaultMessage: 'Wallet name does not match',
  },
  remove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: 'Remove wallet',
  },
  hasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage:
      'I have written down mnemonic of this wallet and understand that I cannot recover the wallet without it.',
  },
})

const handleRemoveWallet =
  ({navigation, removeCurrentWallet}) =>
  async () => {
    await removeCurrentWallet()
    navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
  }

type Prop = {
  intl: IntlShape,
  walletName: string,
  isHW: boolean,
  typedWalletName: string,
  setTypedWalletName: (string) => any,
  handleRemoveWallet: () => any,
  setHasMnemonicWrittenDown: (boolean) => any,
  hasMnemonicWrittenDown: boolean,
}

const RemoveWalletScreen = ({intl, walletName, isHW, handleRemoveWallet}: Prop) => {
  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <View style={styles.descriptionContainer}>
        {!isHW && <Text style={styles.description}>{intl.formatMessage(messages.descriptionParagraph1)}</Text>}
        <Text style={styles.description}>{intl.formatMessage(messages.descriptionParagraph2)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.screenContainer} keyboardDismissMode="on-drag">
        <View style={styles.walletInfo}>
          <Text style={styles.walletNameLabel}>{intl.formatMessage(messages.walletName)}</Text>
          <Text style={styles.walletName}>{walletName}</Text>

          <Spacer />

          <TextInput
            autoFocus
            enablesReturnKeyAutomatically
            label={intl.formatMessage(messages.walletNameInput)}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
            right={typedWalletName === walletName ? <Checkmark /> : undefined}
            errorText={
              typedWalletName !== walletName ? intl.formatMessage(messages.walletNameMismatchError) : undefined
            }
          />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {!isHW && (
          <Checkbox
            checked={hasMnemonicWrittenDown}
            text={intl.formatMessage(messages.hasWrittenDownMnemonic)}
            onChange={setHasMnemonicWrittenDown}
          />
        )}

        <Button
          onPress={handleRemoveWallet}
          title={intl.formatMessage(messages.remove)}
          style={styles.removeButton}
          disabled={disabled}
        />
      </View>
    </View>
  )
}

export default injectIntl(
  compose(
    connect(
      (state: State) => ({
        walletName: walletNameSelector(state),
        isHW: isHWSelector(state),
      }),
      {
        removeCurrentWallet,
      },
    ),
    withHandlers({
      handleRemoveWallet: ignoreConcurrentAsyncHandler(handleRemoveWallet, 1000),
    }),
  )(RemoveWalletScreen),
)

const Spacer = ({height = 16, style}: {height?: number, style?: ViewStyleProp}) => <View style={[{height}, style]} />
