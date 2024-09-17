import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type Props = {
  content: ReactNode
  iconSize?: number
  blue?: boolean
}

export const Warning = ({content, iconSize = 30, blue = false}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={[styles.notice, blue && styles.blueNotice]}>
      <Icon.Info size={iconSize} color={blue ? colors.blue : colors.yellow} />

      <Space height="sm" />

      <Text style={styles.text}>{content}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    notice: {
      backgroundColor: color.sys_yellow_100,
      padding: 12,
      borderRadius: 8,
    },
    blueNotice: {
      backgroundColor: color.sys_cyan_100,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
  })

  const colors = {
    yellow: color.sys_orange_500,
    blue: color.primary_500,
  }

  return {colors, styles}
}
