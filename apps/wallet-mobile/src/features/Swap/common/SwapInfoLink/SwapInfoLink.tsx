import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {SWAP_ZENDESK_LINK} from '../../../../yoroi-wallets/cardano/constants/common'
import {useStrings} from '../strings'

export const SwapInfoLink = () => {
  const strings = useStrings()
  return (
    <TouchableOpacity onPress={() => Linking.openURL(SWAP_ZENDESK_LINK)} style={styles.link}>
      <Text style={styles.linkText}>{strings.listOrdersSheetLink}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  link: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: '#4B6DDE',
    fontSize: 16,
    textDecorationLine: 'underline',
    lineHeight: 22,
  },
})
