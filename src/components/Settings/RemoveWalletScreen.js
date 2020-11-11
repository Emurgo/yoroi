// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Button, Text, Checkbox, ValidatedTextInput, StatusBar} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import {walletNameSelector, isHWSelector} from '../../selectors'
import {removeCurrentWallet} from '../../actions'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/RemoveWalletScreen.style'

import type {State} from '../../state'

const messages = defineMessages({
  title: {
    id: 'components.settings.removewalletscreen.title',
    defaultMessage: 'Remove wallet',
    description: 'some desc',
  },
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage:
      'If you really wish to permanently delete the wallet ' +
      'make sure you have written down the mnemonic.',
    description: 'some desc',
  },
  descriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
    defaultMessage: '!!!To confirm this operation type the wallet name below.',
    description: 'some desc',
  },
  walletName: {
    id: 'components.settings.removewalletscreen.walletName',
    defaultMessage: 'Wallet name',
    description: 'some desc',
  },
  walletNameInput: {
    id: 'components.settings.removewalletscreen.walletNameInput',
    defaultMessage: 'Wallet name',
    description: 'some desc',
  },
  remove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: 'Remove wallet',
    description: 'some desc',
  },
  hasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage:
      'I have written down mnemonic of this wallet and understand ' +
      'that I cannot recover the wallet without it.',
    description: 'some desc',
  },
})

const handleRemoveWallet = ({navigation, removeCurrentWallet}) => async () => {
  await removeCurrentWallet()
  navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
}

type Prop = {
  intl: any,
  walletName: string,
  isHW: boolean,
  typedWalletName: string,
  setTypedWalletName: (string) => any,
  handleRemoveWallet: () => any,
  setHasMnemonicWrittenDown: (boolean) => any,
  hasMnemonicWrittenDown: boolean,
}

const RemoveWalletScreen = ({
  intl,
  walletName,
  isHW,
  handleRemoveWallet,
  hasMnemonicWrittenDown,
  setHasMnemonicWrittenDown,
  typedWalletName,
  setTypedWalletName,
}: Prop) => {
  const disabled =
    (!isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <View style={styles.descriptionContainer}>
        {!isHW && (
          <Text style={styles.description}>
            {intl.formatMessage(messages.descriptionParagraph1)}
          </Text>
        )}
        <Text style={styles.description}>
          {intl.formatMessage(messages.descriptionParagraph2)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.screenContainer}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.walletInfo}>
          <Text style={styles.walletNameLabel}>
            {intl.formatMessage(messages.walletName)}
          </Text>
          <Text style={styles.walletName}>{walletName}</Text>

          <ValidatedTextInput
            label={intl.formatMessage(messages.walletNameInput)}
            value={typedWalletName}
            onChangeText={setTypedWalletName}
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
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withStateHandlers(
      {
        hasMnemonicWrittenDown: false,
        typedWalletName: '',
      },
      {
        setHasMnemonicWrittenDown: () => (value) => ({
          hasMnemonicWrittenDown: value,
        }),
        setTypedWalletName: () => (value) => ({typedWalletName: value}),
      },
    ),
    withHandlers({
      handleRemoveWallet: ignoreConcurrentAsyncHandler(
        handleRemoveWallet,
        1000,
      ),
    }),
  )(RemoveWalletScreen),
)
