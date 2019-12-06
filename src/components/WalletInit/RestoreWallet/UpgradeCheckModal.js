// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, ScrollView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'

import type {Navigation} from '../../../types/navigation'
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
      '!!!If you had any ADA in your wallet on November 29th, 2019, you will' +
      'have to upgrade your wallet to a Shelley "reward wallet"',
  },
  checkText: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.checkText',
    defaultMessage: '!!!Do you want to check if your wallet needs to be upgraded?',
  },
  checkButton: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.checkButton',
    defaultMessage: '!!!Confirm',
  },
  skipButton: {
    id: 'components.walletinit.restorewallet.upgradecheckmodal.skipButton',
    defaultMessage: '!!!Skip',
  },
})

type Props = {
  intl: any,
  visible: boolean,
  onCheck: () => any,
  onSkip: () => any,
  onRequestClose: () => any,
}

class UpgradeCheckModal extends React.Component<Props> {
  render() {
    const {
      intl,
      visible,
      onCheck,
      onSkip,
      onRequestClose,
    } = this.props

    return (
      <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
        <ScrollView style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <Image source={image} />
          </View>
          <View style={styles.content}>
            <View style={styles.heading}>
              { /* <Image source={imageSucess} /> */}
              <Text style={styles.title} small>
                {/* intl.formatMessage(messages.title) */}
                {messages.title.defaultMessage}
              </Text>
            </View>
            <View>
              <Text>
                {/* intl.formatMessage(messages.explanation) */}
                {messages.explanation.defaultMessage}
              </Text>
              <Text>
            {/* intl.formatMessage(messages.checkText) */}
                {messages.checkText.defaultMessage}
              </Text>
            </View>
          </View>
          <View style={styles.buttons}>
            <Button
              block
              outlineOnLight
              onPress={onSkip}
              // title={intl.formatMessage(messages.skipButton)}
              title={messages.skipButton.defaultMessage}
              style={styles.skipButton}
            />

            <Button
              block
              onPress={onCheck}
              // title={intl.formatMessage(messages.checkButton)}
              title={messages.checkButton.defaultMessage}
              style={styles.checkButton}
            />
          </View>
        </ScrollView>
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
  )(UpgradeCheckModal): ComponentType<ExternalProps>),
)
