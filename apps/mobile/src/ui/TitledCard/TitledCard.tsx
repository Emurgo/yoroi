import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../Space/Space'
import {Text} from '../Text/Text'

type ExternalProps = {
  title?: string
  children: React.ReactNode
  variant?: string
  testID?: string
}

export const TitledCard = ({title, children, testID}: ExternalProps) => {
  const {color} = useTheme()
  return (
    <View>
      {title !== undefined && (
        <Text style={[styles.title, {color: color.text_gray_low}]}>
          {title}
        </Text>
      )}

      <Space height="sm" />

      <View
        style={[styles.content, {borderColor: color.gray_200}]}
        testID={testID}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    ...a.body_1_lg_regular,
    ...a.justify_center,
  },
  content: {
    ...a.p_lg,
    borderWidth: 1,
    borderRadius: 8,
  },
})
