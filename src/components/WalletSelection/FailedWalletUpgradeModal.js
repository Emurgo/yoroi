// @flow

import React from 'react'
import {View, ScrollView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../UiKit'

import styles from './styles/FailedWalletUpgradeModal.style'
import image from '../../assets/img/mnemonic_explanation.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.failedwalletupgrademodal.title',
    defaultMessage: '!!!Heads up!',
  },
  explanation1: {
    id: 'components.delegationsummary.failedwalletupgrademodal.explanation1',
    defaultMessage:
      '!!!Some users experienced problems while upgrading their ' +
      'wallets in the Shelley testnet.',
  },
  explanation2: {
    id: 'components.delegationsummary.failedwalletupgrademodal.explanation2',
    defaultMessage:
      '!!!If you observed an unexpected zero balance after ' +
      'having upgraded your wallet, we recommend you to restore your wallet ' +
      'once again. We apologize for any inconvinience this may have caused.',
  },
  okButton: {
    id: 'components.delegationsummary.failedwalletupgrademodal.okButton',
    defaultMessage: '!!!OK',
  },
})

type Props = {
  intl: intlShape,
  visible: boolean,
  onPress: () => any,
  onRequestClose: () => any,
}

const FailedWalletUpgradeModal = ({
  intl,
  visible,
  onPress,
  onRequestClose,
}: Props) => {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.title}>
              {intl.formatMessage(messages.title)}
            </Text>
            <Image source={image} />
          </View>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation1)}
          </Text>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation2)}
          </Text>
        </View>
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={onPress}
            title={intl.formatMessage(messages.okButton)}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

export default injectIntl((FailedWalletUpgradeModal: ComponentType<Props>))
