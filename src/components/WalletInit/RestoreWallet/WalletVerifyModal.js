// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'

import AddressEntry from '../../Common/AddressEntry'
import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {confirmationMessages} from '../../../i18n/global-messages'

import styles from './styles/WalletVerifyModal.style'

import type {ComponentType} from 'react'


const renderBulletPointItem = (textRow) => {
  return (<Text>{'\u2022'} {textRow}</Text>)
}

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.title',
    defaultMessage: '!!!Verify restored wallet',
  },
  verifyLabel: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyLabel',
    defaultMessage:
      '!!!Be careful about wallet restoration:',
  },
  verifyInstructions1: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions1',
    defaultMessage: '!!!Make sure Byron addresses match what you remember.',
  },
  verifyInstructions2: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions2',
    defaultMessage: "!!!If you've entered wrong mnemonics you will just open " +
    'another empty wallet with wrong addresses.',
  },
  byronAddressesLabel: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.byronAddressLabel',
    defaultMessage: '!!!Byron wallet address:',
  },
  shelleyAddressesLabel: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.shelleyAddressLabel',
    defaultMessage: '!!!Shelley wallet address:',
  },
})

type Props = {
  intl: any,
  visible: boolean,
  onConfirm: () => mixed,
  onBack: () => void,
  byronAddress: string,
  shelleyAddress: string,
}

class WalletVerifyModal extends React.Component<Props, State> {
  render() {
    const {
      intl,
      visible,
      onConfirm,
      onBack,
      byronAddress,
      shelleyAddress,
    } = this.props


    return (
      <Modal visible={visible}>
        <View style={styles.safeAreaView}>
          <View style={styles.container}>

            <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>

            <Text style={styles.label}>
              {intl.formatMessage(messages.verifyLabel)}
            </Text>
            {renderBulletPointItem(intl.formatMessage(messages.verifyInstructions1))}
            {renderBulletPointItem(intl.formatMessage(messages.verifyInstructions2))}

            <Text style={styles.label}>
              {intl.formatMessage(messages.byronAddressesLabel)}
            </Text>
            <AddressEntry address={byronAddress} />
            <Text style={styles.label}>
              {intl.formatMessage(messages.shelleyAddressesLabel)}
            </Text>
            <AddressEntry address={shelleyAddress} />

            <View style={styles.buttons}>
              <Button
                block
                outlineShelley
                onPress={onBack}
                title={intl.formatMessage(
                  confirmationMessages.commonButtons.backButton)}
                style={styles.leftButton}
              />
              <Button
                block
                onPress={onConfirm}
                title={intl.formatMessage(
                  confirmationMessages.commonButtons.confirmButton)}
                shelleyTheme
                style={styles.rightButton}
              />
            </View>
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
    // withHandlers({
    //   onSkip: ({navigation}) => (event) => navigation.popToTop(),
    // }),
  )(WalletVerifyModal): ComponentType<ExternalProps>),
)
