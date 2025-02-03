import {getDexUrlByProtocol} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {ProtocolIcon} from './ProtocolIcon'

type Props = {
  protocol: Swap.Protocol
  append?: string
  preventOpenLink?: boolean
}

export const ProtocolAvatar = ({protocol, append = '', preventOpenLink = false}: Props) => {
  const styles = useStyles()
  const formattedName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/, ' ')}${append}`

  return (
    <View style={styles.container}>
      <ProtocolIcon protocol={protocol} size={18} />

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => Linking.openURL(getDexUrlByProtocol(protocol))}
        style={styles.button}
        disabled={preventOpenLink}
      >
        <Text style={[styles.text, !preventOpenLink && styles.link]}>{formattedName}</Text>
      </TouchableOpacity>
    </View>
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
      ...atoms.py_2xs,
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    link: {
      color: color.text_primary_medium,
    },
    container: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
  })

  return styles
}
