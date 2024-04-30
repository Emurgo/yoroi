import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Icon, Spacer} from '../../components'
import {Modal} from '../../legacy/Modal'

type Props = {
  visible: boolean
  hideModalInfo: () => void
  children: React.ReactNode
}

export const ModalInfo = ({visible, hideModalInfo, children}: Props) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <Modal visible={visible} showCloseIcon onRequestClose={hideModalInfo} title={strings.infoTitle}>
      <Spacer height={16} />

      <Icon.Info style={styles.infoIcon} size={45} color={colors.iconColor} />

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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    infoIcon: {
      alignSelf: 'center',
      ...atoms.p_2xs,
    },
  })
  const colors = {
    iconColor: color.gray_c500,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    infoTitle: intl.formatMessage(messages.infoTitle),
  }
}
