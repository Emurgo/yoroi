// @flow

import React from 'react'
import {View, ScrollView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../../UiKit'

import styles from './styles/UpgradeCheckModal.style'
import image from '../../../assets/img/mnemonic_explanation.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.title',
    defaultMessage: '!!!Wallet upgrade',
  },
  explanation: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.explanation',
    defaultMessage:
      '!!!If you had ADA in your wallet on December 5th, 2019, you will need ' +
      'to upgrade to a new wallet format called a "reward wallet" for ' +
      'compatibility with Shelley.',
  },
  checkText: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.checkText',
    defaultMessage:
      '!!!Do you want to check if your wallet needs to be upgraded?',
  },
  checkButton: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.checkButton',
    defaultMessage: '!!!Check',
  },
  skipButton: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.skipButton',
    defaultMessage: '!!!Skip',
  },
})

type Props = {
  intl: intlShape,
  visible: boolean,
  onCheck: () => any,
  onSkip: () => any,
  onRequestClose: () => any,
}

const UpgradeCheckModal = ({
  intl,
  visible,
  onCheck,
  onSkip,
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
            {intl.formatMessage(messages.explanation)}
          </Text>
          <Text>{intl.formatMessage(messages.checkText)}</Text>
        </View>
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={onSkip}
            title={intl.formatMessage(messages.skipButton)}
            style={styles.leftButton}
          />
          <Button
            block
            onPress={onCheck}
            title={intl.formatMessage(messages.checkButton)}
            shelleyTheme
            style={styles.rightButton}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

export default injectIntl((UpgradeCheckModal: ComponentType<Props>))
