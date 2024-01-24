import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Icon, Spacer} from '../../components'
import {Modal} from '../../legacy/Modal'
import {COLORS} from '../../theme'

type Props = {
  visible: boolean
  hideModalInfo: () => void
  children: React.ReactNode
}

export const ModalInfo = ({visible, hideModalInfo, children}: Props) => {
  const strings = useStrings()

  return (
    <Modal visible={visible} showCloseIcon onRequestClose={hideModalInfo} title={strings.infoTitle}>
      <Spacer height={16} />

      <Icon.Info style={styles.infoIcon} size={45} color={COLORS.ACTION_GRAY} />

      <Spacer height={32} />

      {children}
    </Modal>
  )
}

const messages = defineMessages({
  infoTitle: {
    id: 'global.info',
    defaultMessage: '!!!Info',
  },
})

const styles = StyleSheet.create({
  infoIcon: {
    alignSelf: 'center',
    padding: 2,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    infoTitle: intl.formatMessage(messages.infoTitle),
  }
}
