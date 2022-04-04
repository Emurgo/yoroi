import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Icon, Modal, Spacer} from '../../components'
import {COLORS} from '../../theme'

type Props = {
  visible: boolean
  hideModalInfo: () => void
}

export const ModalInfo: React.FC<Props> = ({visible, hideModalInfo, children}) => {
  const strings = useStrings()

  return (
    <Modal visible={visible} showCloseIcon onRequestClose={hideModalInfo} title={strings.infoTitle}>
      <Spacer height={16} />

      <Icon.Info size={45} color={COLORS.ACTION_GRAY} style={styles.infoIcon} />

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

const useStrings = () => {
  const intl = useIntl()

  return {
    infoTitle: intl.formatMessage(messages.infoTitle),
  }
}

const styles = StyleSheet.create({
  infoIcon: {
    alignSelf: 'center',
    padding: 2,
  },
})
