import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {useStrings} from '../strings'

const SWAP_ZENDESK_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8154256843407-Swap'

export const SwapInfoLink = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  return (
    <TouchableOpacity onPress={() => Linking.openURL(SWAP_ZENDESK_LINK)} style={styles.link}>
      <Text style={styles.linkText}>{strings.listOrdersSheetLink}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    link: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    linkText: {
      color: color.el_primary_medium,
      ...atoms.link_1_lg,
    },
  })

  return {styles} as const
}
