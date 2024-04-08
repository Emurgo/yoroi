import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../../common/useStrings'

type Props = {
  total: number
}
export const CountDAppsAvailable = ({total}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.countAvailableBox}>
      <Text style={styles.availableText}>{`${total} ${strings.totalDAppAvailable}`}</Text>
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
