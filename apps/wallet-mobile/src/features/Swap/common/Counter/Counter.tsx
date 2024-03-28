export type FungibilityFilter = 'all' | 'ft' | 'nft'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Text} from '../../../../components'

type CounterTypes = {
  openingText?: string
  counter: number
  unitsText?: string
  closingText?: string
}

export const Counter = ({openingText, counter, unitsText, closingText, style}: CounterTypes & ViewProps) => {
  const styles = useStyles()

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

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    counter: {
      paddingTop: 16,
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: color.gray.min,
    },
    counterText: {
      ...typography['body-2-m-medium'],
      color: color.primary[600],
    },
    counterTextBold: {
      ...typography['body-2-m-regular'],
      color: color.primary[600],
    },
  })

  return styles
}
