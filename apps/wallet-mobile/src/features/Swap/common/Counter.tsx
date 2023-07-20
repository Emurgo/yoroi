export type FungibilityFilter = 'all' | 'ft' | 'nft'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../components'
import {COLORS} from '../../../theme'
import {useStrings} from './strings'

export const Counter = ({length}: {length: number}) => {
  const strings = useStrings()
  return (
    <View style={styles.counter}>
      <Text style={styles.counterTextBold}>{`${length} ${strings.pools(length)} `}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  counter: {
    padding: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: '35%',
  },

  counterTextBold: {
    fontWeight: '500',
    color: COLORS.SHELLEY_BLUE,
  },
})
