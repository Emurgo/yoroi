// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import Markdown from 'react-native-easy-markdown'

import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {ROOT_ROUTES} from '../../../RoutesList'

import styles from './styles/BalanceCheckModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  recoveryTitle: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.recoveryTitle',
    defaultMessage: '!!!Recovery Successful',
  },
  attention: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.attention',
    defaultMessage: '!!!Attention',
  },
  attentionDescription: {
    id:
      'components.walletinit.balancecheck.balancecheckmodal.attentionDescription',
    defaultMessage:
      '!!!The balance check executed successfully, and we were ' +
      'able to match your wallet with the balance displayed below. Remember that ' +
      'the balance displayed should only match the one that you **had on ' +
      'November 12th**.',
  },
  walletAddressesLabel: {
    id:
      'components.walletinit.balancecheck.balancecheckmodal.walletAddressesLabel',
    defaultMessage: '!!!Wallet addresses',
  },
  recoveredBalanceLabel: {
    id:
      'components.walletinit.balancecheck.balancecheckmodal.recoveredBalanceLabel',
    defaultMessage: '!!!Recovered balance',
  },
  buttonText: {
    id: 'components.walletinit.balancecheck.balancecheckmodal.buttonText',
    defaultMessage: '!!!Done',
  },
})

type Props = {
  intl: any,
  visible: boolean,
  onRequestClose: () => any,
  navigateWalletInit: () => mixed,
  navigation: Navigation,
}

class BalanceCheckModal extends React.Component<Props> {
  render() {
    const {intl, visible, navigateWalletInit, onRequestClose} = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
        <View style={styles.content}>
          <View style={styles.item}>
            <Text style={styles.heading} small>
              {intl.formatMessage(messages.attention)}
            </Text>
            <Markdown>
              {intl.formatMessage(messages.attentionDescription)}
            </Markdown>
          </View>

          <View style={styles.item}>
            <Text style={styles.heading} small>
              {intl.formatMessage(messages.walletAddressesLabel)}
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.heading} small>
              {intl.formatMessage(messages.recoveredBalanceLabel)}
            </Text>
            <Text style={styles.balanceAmount}>12354.23 ADA</Text>
          </View>
        </View>

        <Button
          onPress={navigateWalletInit}
          title={intl.formatMessage(messages.buttonText)}
          shelleyTheme
        />
      </Modal>
    )
  }
}

type ExternalProps = {
  visible: boolean,
  onRequestClose: () => any,
  intl: intlShape,
  navigation: Navigation,
}

export default injectIntl(
  (compose(
    withHandlers({
      navigateWalletInit: ({navigation}) => (event) =>
        navigation.navigate(ROOT_ROUTES.WALLET),
    }),
  )(BalanceCheckModal): ComponentType<ExternalProps>),
)
