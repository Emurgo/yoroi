import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {useStrings} from '../strings'

export const SwapInfoLink = () => {
  const strings = useStrings()
  return (
    // TODO: add real link
    <TouchableOpacity onPress={() => Linking.openURL('https://yoroi-wallet.com/#/')} style={styles.link}>
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
