import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'

export const MultiAddressResolutionNotice = () => {
  return (
    <View style={styles.notice}>
      <Icon.Info size={30} color="#ECBA09" />

      <Spacer height={8} />

      <Text style={styles.text}>There are two addresses for this domain. Please choose the desired domain.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FDF7E2',
    padding: 12,
  },
  text: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
})
