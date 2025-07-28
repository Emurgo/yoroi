import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {splitInLines} from '../splitInLines'

type ButtonCardProps = {
  title: string
  subTitle?: string
  icon?: React.ReactNode
  onPress: () => void
  testID?: string
}

export const ButtonCard = ({
  title,
  subTitle,
  icon = null,
  onPress,
  testID,
}: ButtonCardProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        {height: 120},
        a.flex_row,
        a.align_center,
        a.overflow_hidden,
        a.rounded_sm,
        a.px_lg,
        icon ? {...a.justify_between} : {...a.justify_center},
      ]}
      onPress={onPress}
      testID={testID}
    >
      <LinearGradient
        style={{...StyleSheet.absoluteFillObject, opacity: 1}}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={p.bg_gradient_1}
      />

      {icon ? (
        <Text style={(a.heading_4_medium, {color: p.gray_max})}>
          {splitInLines(title)}
        </Text>
      ) : (
        <View style={[a.align_center, a.justify_center]}>
          <Text
            style={[a.heading_4_medium, a.text_center, {color: p.gray_max}]}
          >
            {title}
          </Text>
          {subTitle !== undefined && (
            <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
              {subTitle}
            </Text>
          )}
        </View>
      )}

      {icon}
    </TouchableOpacity>
  )
}
