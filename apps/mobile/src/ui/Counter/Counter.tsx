import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Text} from '../Text/Text'

type CounterTypes = {
  openingText?: string
  counter: number
  unitsText?: string
  closingText?: string
}

export const Counter = ({
  openingText,
  counter,
  unitsText,
  closingText,
  style,
}: CounterTypes & ViewProps) => {
  const {color} = useTheme()

  return (
    <View
      style={[styles.counter, {backgroundColor: color.bg_color_max}, style]}
    >
      <Text style={[styles.counterText, {color: color.primary_600}]}>
        {openingText}
      </Text>

      <Text>
        <Text style={[styles.counterTextBold, {color: color.primary_600}]}>
          {' '}
          {counter}{' '}
        </Text>

        {unitsText !== undefined && (
          <Text style={[styles.counterTextBold, {color: color.primary_600}]}>
            {' '}
            {unitsText ?? ''}{' '}
          </Text>
        )}

        {closingText !== undefined && (
          <Text
            style={[
              openingText != undefined
                ? [styles.counterTextBold, {color: color.primary_600}]
                : [styles.counterText, {color: color.primary_600}],
            ]}
          >
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
  },
  counterText: {
    ...a.body_2_md_regular,
  },
  counterTextBold: {
    ...a.body_2_md_medium,
  },
})
