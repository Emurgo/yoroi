// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'

import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {confirmationMessages} from '../../../i18n/global-messages'

import styles from './styles/WalletVerifyModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.title',
    defaultMessage: '!!!Verify Restored Wallet',
  },
  verifyLabel: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyLabel',
    defaultMessage:
      '!!!Be careful about wallet restoration:',
  },
  verifyInstructions1: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions1',
    defaultMessage: '!!!Make sure Byron addresses match what you remember.',
  },
  verifyInstructions2: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions2',
    defaultMessage: "!!!If you've entered wrong mnemonics you will just open" +
    'another empty wallet with wrong addresses',
  },
  byronAddressesLabel: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.byronAddressesLabel',
    defaultMessage: '!!!Byron wallet address[es]',
  },
  shelleyAddresses: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.shelleyAddresses',
    defaultMessage: '!!!Shelley wallet address[es]',
  },
  confirmButton: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.confirmButton',
    defaultMessage: '!!!Confirm',
    description: 'some desc',
  },
  backButton: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.backButton',
    defaultMessage: '!!!Back',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  byronAddresses: Array<string>,
  shelleyAddress: Array<string>,
}

class WalletVerifyModal extends React.Component<Props, State> {
  render() {
    const {
      intl,
      visible,
      onRequestClose,
      onConfirmVerify,
      onBack,
    } = this.props


    return (
      <Modal visible={visible} onRequestClose={onRequestClose}>
        <View style={styles.safeAreaView}>
          <View style={styles.container}>

            <Text style={styles.title}>
              {/* {intl.formatMessage(messages.verifyLabel) */}
              {messages.title.defaultMessage}
            </Text>

            {/* <Text>{intl.formatMessage(messages.verifyInstructions1)}</Text> */}
            <Text>{messages.verifyInstructions1.defaultMessage}</Text>
            {/* <Text>{intl.formatMessage(messages.verifyInstructions2)}</Text> */}
            <Text>{messages.verifyInstructions2.defaultMessage}</Text>

          </View>

          <View style={styles.buttons}>
            <Button
              block
              outlineOnLight
              onPress={onBack}
              // title={intl.formatMessage(messages.skipButton)}
              title={messages.skipButton.defaultMessage}
              style={styles.backButton}
            />

            <Button
              onPress={onConfirmVerify}
              // title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
              title={confirmationMessages.commonButtons.confirmButton.defaultMessage}
              shelleyTheme
            />
          </View>
        </View>
      </Modal>
    )
  }
}

type ExternalProps = {
  intl: intlShape,
  navigation: Navigation,
}

export default injectIntl(
  (compose(
    withNavigation,
    withHandlers({
      onSkip: ({navigation}) => (event) => navigation.popToTop(),
    }),
  )(WalletVerifyModal): ComponentType<ExternalProps>),
)
