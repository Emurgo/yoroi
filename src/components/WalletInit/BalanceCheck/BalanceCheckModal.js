// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableOpacity, ScrollView, Image, Linking} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import Markdown from 'react-native-easy-markdown'
import {withNavigation} from 'react-navigation'
import {BigNumber} from 'bignumber.js'

import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {formatAdaWithText} from '../../../utils/format'
import {CARDANO_CONFIG} from '../../../config'

import styles from './styles/BalanceCheckModal.style'
import image from '../../../assets/img/no_transactions_yet.inline.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  recoveryEmptyMessage: {
    id:
      'components.walletinit.balancecheck.balancecheckmodal.recoveryEmptyMessage',
    defaultMessage:
      '!!!The wallet restored from your recovery phrase is ' +
      'empty. Please check your recovery phrase and attempt restoration again.',
  },
  recoveryEmptyButtonText: {
    id:
      'components.walletinit.balancecheck.balancecheckmodal.recoveryEmptyButtonText',
    defaultMessage: '!!!Check again',
  },
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

const AddressEntry = withHandlers({
  onPress: ({address}) => () => {
    Linking.openURL(CARDANO_CONFIG.SHELLEY.EXPLORER_URL_FOR_ADDRESS(address))
  },
})(({address, onPress}) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text secondary>{address}</Text>
    </TouchableOpacity>
  )
})

type Props = {
  intl: any,
  visible: boolean,
  addresses: Array<string>,
  balance: BigNumber,
  onRequestClose: () => any,
  buttonHandler: () => any,
}

class BalanceCheckModal extends React.Component<Props> {
  render() {
    const {
      intl,
      visible,
      addresses,
      balance,
      buttonHandler,
      onRequestClose,
    } = this.props

    if (addresses.length > 0) {
      return (
        <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
          <ScrollView>
            <View style={styles.content}>
              <Text style={styles.title} small>
                {intl.formatMessage(messages.recoveryTitle)}
              </Text>
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
                {addresses.map((address, i) => (
                  <AddressEntry key={i} address={address} />
                ))}
              </View>
              <View style={styles.item}>
                <Text style={styles.heading} small>
                  {intl.formatMessage(messages.recoveredBalanceLabel)}
                </Text>
                <Text style={styles.balanceAmount}>
                  {balance && formatAdaWithText(balance)}
                </Text>
              </View>
            </View>
            <Button
              onPress={buttonHandler}
              title={intl.formatMessage(messages.buttonText)}
              shelleyTheme
            />
          </ScrollView>
        </Modal>
      )
    } else {
      return (
        <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
          <ScrollView>
            <View style={styles.empty}>
              <Image source={image} />
              <Text>{intl.formatMessage(messages.recoveryEmptyMessage)}</Text>
            </View>
            <Button
              onPress={onRequestClose}
              title={intl.formatMessage(messages.recoveryEmptyButtonText)}
              shelleyTheme
            />
          </ScrollView>
        </Modal>
      )
    }
  }
}

type ExternalProps = {
  visible: boolean,
  addresses: Array<string>,
  balance: BigNumber,
  onRequestClose: () => any,
  intl: intlShape,
  navigation: Navigation,
}

export default injectIntl(
  (compose(
    withNavigation,
    withHandlers({
      buttonHandler: ({navigation}) => (event) => navigation.popToTop(),
    }),
  )(BalanceCheckModal): ComponentType<ExternalProps>),
)
