import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text} from 'react-native'

import {Modal, Spacer} from '../../../legacy/components/UiKit'
import {COLORS} from '../../../legacy/styles/config'
import {Icon} from '../../components'
import {useModalInfo} from './ModalInfoContext'

export const ModalInfo = () => {
  const strings = useStrings()
  const {isModalInfoOpen, hideModalInfo} = useModalInfo()

  if (!isModalInfoOpen) return null

  return (
    <Modal visible showCloseIcon onRequestClose={hideModalInfo} title={strings.infoTitle}>
      <Spacer height={16} />

      <Icon.Info size={45} color={COLORS.ACTION_GRAY} style={styles.infoIcon} />

      <Spacer height={32} />
      <Text style={styles.infoText}>{strings.infoText}</Text>
    </Modal>
  )
}

const messages = defineMessages({
  infoTitle: {
    id: 'global.info',
    defaultMessage: '!!!Info',
  },
  infoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    infoTitle: intl.formatMessage(messages.infoTitle),
    infoText: intl.formatMessage(messages.infoText),
  }
}

const styles = StyleSheet.create({
  infoText: {
    lineHeight: 24,
    fontSize: 16,
  },
  infoIcon: {
    alignSelf: 'center',
    padding: 2,
  },
})
