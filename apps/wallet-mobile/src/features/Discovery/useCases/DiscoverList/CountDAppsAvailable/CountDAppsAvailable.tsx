// @flow
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

type Props = {
  total: number
}
export const CountDAppsAvailable = ({total}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.countAvailableBox}>
      <Text style={styles.availableText}>{`${total} DApp(s) available`}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const styles = StyleSheet.create({
    availableText: {
      ...typography['body-2-m-regular'],
      color: color.gray[700],
    },
    countAvailableBox: {
      ...padding['x-l'],
    },
  })
  return {styles} as const
}
