import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type Props = {
  content: ReactNode
  iconSize?: number
  title?: string
}

export const WarningBanner = ({content, iconSize = 30, title = ''}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.notice}>
      <View style={styles.titleContainer}>
        <Icon.Info size={iconSize} color={colors.yellow} />

        <Space width="sm" />

        <Text style={styles.title}>{title}</Text>
      </View>

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
      ...atoms.p_md,
      ...atoms.rounded_sm,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
    titleContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    title: {
      color: color.text_gray_max,
      ...atoms.body_2_md_medium,
    },
  })

  const colors = {
    yellow: color.sys_orange_500,
  }

  return {colors, styles} as const
}
