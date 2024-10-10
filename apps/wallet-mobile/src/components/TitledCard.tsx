import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from './Space/Space'
import {Text} from './Text'

type ExternalProps = {
  title?: string
  children: React.ReactNode
  variant?: string
  testID?: string
}

export const TitledCard = ({title, children, testID}: ExternalProps) => {
  const styles = useStyles()
  return (
    <View>
      {title !== undefined && <Text style={styles.title}>{title}</Text>}

      <Space height="sm" />

      <View style={styles.content} testID={testID}>
        {children}
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...atoms.body_1_lg_regular,
      ...atoms.justify_center,
      color: color.text_gray_low,
    },
    content: {
      ...atoms.p_lg,
      borderColor: color.gray_200,
      borderWidth: 1,
      borderRadius: 8,
    },
  })
  return styles
}
