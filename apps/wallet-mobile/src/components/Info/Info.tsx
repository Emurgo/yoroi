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

export const Info = ({content, iconSize = 30}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.notice}>
      <Icon.Info size={iconSize} color={colors.blue} />

      <Space height="sm" />

      <Text style={styles.text}>{content}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    notice: {
      backgroundColor: color.sys_cyan_100,
      ...atoms.p_md,
      borderRadius: 8,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
  })

  const colors = {
    yellow: color.sys_orange_500,
    blue: color.primary_500,
  }

  return {colors, styles} as const
}
