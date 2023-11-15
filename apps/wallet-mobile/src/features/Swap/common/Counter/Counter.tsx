export type FungibilityFilter = 'all' | 'ft' | 'nft'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Text} from '../../../../components'
import {COLORS} from '../../../../theme'

type CounterTypes = {
  openingText?: string
  counter: number
  unitsText?: string
  closingText?: string
}

export const Counter = ({openingText, counter, unitsText, closingText, style}: CounterTypes & ViewProps) => {
  return (
    <View style={[styles.counter, style]}>
      <Text style={styles.counterText}>{openingText}</Text>

      <Text>
        <Text style={styles.counterTextBold}> {counter} </Text>

        {unitsText !== undefined && <Text style={styles.counterTextBold}> {unitsText ?? ''} </Text>}

        {closingText !== undefined && (
          <Text style={[openingText != undefined ? styles.counterTextBold : styles.counterText]}>
            {closingText ?? ''}
          </Text>
        )}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  counter: {
    paddingTop: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  counterText: {
    fontWeight: '400',
    color: COLORS.SHELLEY_BLUE,
  },
  counterTextBold: {
    fontWeight: '500',
    color: COLORS.SHELLEY_BLUE,
    fontFamily: 'Rubik-Medium',
  },
})
