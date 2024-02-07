import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

type Props = {content: string}

export const Warning = ({content}: Props) => {
  return (
    <View style={styles.notice}>
      <Icon.Info size={30} color="#ECBA09" />

      <Spacer height={8} />

      <Text style={styles.text}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FDF7E2',
    padding: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'Rubik-Regular',
  },
})
