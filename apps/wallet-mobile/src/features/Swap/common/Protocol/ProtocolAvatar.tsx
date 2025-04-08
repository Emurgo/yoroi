import {getDexUrlByProtocol} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {ProtocolIcon} from './ProtocolIcon'

type Props = {
  protocol: Swap.Protocol
  append?: string
  onPress?: () => void
  preventOpenLink?: boolean
}

export const ProtocolAvatar = ({protocol, append = '', onPress, preventOpenLink = false}: Props) => {
  const styles = useStyles()
  const formattedName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/, ' ')}${append}`

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => Linking.openURL(getDexUrlByProtocol(protocol)))}
      style={[styles.container, styles.button]}
      disabled={preventOpenLink}
    >
      <ProtocolIcon protocol={protocol} size={18} />

      <Text style={[styles.text, !preventOpenLink && styles.link]}>{formattedName}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    button: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    text: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    link: {
      ...atoms.body_1_lg_medium,
      color: color.text_primary_medium,
    },
    container: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
  })

  return styles
}
