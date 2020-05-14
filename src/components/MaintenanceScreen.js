// @flow

import React from 'react'
import {View, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Modal, Link} from './UiKit'

import styles from './styles/MaintenanceScreen.styles'
import image from '../assets/img/error.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.maintenancemodal.title',
    defaultMessage: '!!!Temporary Maintenance',
  },
  attention: {
    id: 'components.maintenancemodal.attention',
    defaultMessage: '!!!ATTENTION:',
  },
  explanation: {
    id: 'components.maintenancemodal.explanation',
    defaultMessage:
      '!!!Yoroi is on maintenance mode. You can still access your funds ' +
      'through any other wallet software.',
  },
  learnMore: {
    id: 'components.maintenancemodal.learnMore',
    defaultMessage: '!!!Learn more',
  },
})

const URL = 'https://twitter.com/YoroiWallet'

type Props = {
  intl: intlShape,
  visible: boolean,
  onRequestClose: () => void,
}

const MaintenanceModal = ({intl, visible, onRequestClose}: Props) => {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose} noPadding>
      <View style={styles.title}>
        <Text style={styles.titleText}>
          {intl.formatMessage(messages.title)}
        </Text>
      </View>
      <View style={styles.content}>
        <Image source={image} style={styles.image} />
        <Text style={[styles.paragraph, styles.attention]}>
          {intl.formatMessage(messages.attention)}
        </Text>
        <Text style={styles.paragraph}>
          {intl.formatMessage(messages.explanation)}
        </Text>
        <Link
          url={URL}
          text={intl.formatMessage(messages.learnMore)}
          style={styles.paragraph}
        />
      </View>
    </Modal>
  )
}

const MaintenanceScreen = ({intl}) => (
  <MaintenanceModal
    visible
    onRequestClose={
      /* eslint-disable-next-line */
      () => {}
    }
    intl={intl}
  />
)

export default injectIntl(
  (MaintenanceScreen: ComponentType<{
    intl: intlShape,
  }>),
)
