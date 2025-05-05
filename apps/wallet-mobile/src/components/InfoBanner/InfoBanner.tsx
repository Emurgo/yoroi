import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type Props = {content: React.ReactNode; title?: string; iconSize?: number}

export const InfoBanner = ({content, title, iconSize = 30}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.notice}>
      <View style={styles.titleContainer}>
        <Icon.Info size={iconSize} color={colors.icon} />

        <Space width="sm" />

        {title != null && <Text style={styles.title}>{title}</Text>}
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
      backgroundColor: color.sys_cyan_100,
      ...atoms.p_md,
      borderRadius: 8,
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
    icon: color.primary_500,
  }

  return {colors, styles}
}
