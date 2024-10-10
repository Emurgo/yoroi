import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TextStyle, View} from 'react-native'

import {Space} from './Space/Space'
import {Text} from './Text'

type Props = {
  textRow: string
  style?: TextStyle
}

export const BulletPointItem = ({textRow, style}: Props) => {
  const styles = useStyles()
  return (
    <View style={styles.container}>
      <Space width="sm" />

      <Text style={style}>{'\u2022'}</Text>

      <Space width="sm" />

      <View style={styles.row}>
        <Text style={style}>{textRow}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_row,
    },
    row: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.flex_wrap,
    },
  })

  return styles
}
