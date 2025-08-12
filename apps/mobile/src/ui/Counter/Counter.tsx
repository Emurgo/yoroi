import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View, ViewProps} from 'react-native'

import {Text} from '~/ui/Text/Text'

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
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        {
          paddingTop: 16,
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: p.bg_color_max,
        },
        style,
      ]}
    >
      <Text style={[a.body_2_md_regular, {color: p.primary_600}]}>
        {' '}
        {openingText}
      </Text>

      <Text>
        <Text style={[a.body_2_md_medium, {color: p.primary_600}]}>
          {' '}
          {counter}{' '}
        </Text>

        {unitsText !== undefined && (
          <Text style={[a.body_2_md_medium, {color: p.primary_600}]}>
            {' '}
            {unitsText ?? ''}{' '}
          </Text>
        )}

        {closingText !== undefined && (
          <Text
            style={[
              openingText != undefined
                ? [a.body_2_md_medium, {color: p.primary_600}]
                : [a.body_2_md_regular, {color: p.primary_600}],
            ]}
          >
            {closingText ?? ''}
          </Text>
        )}
      </Text>
    </View>
  )
}
