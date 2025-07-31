import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type Props = {
  content: React.ReactNode
  title?: string
  iconSize?: number
}

export const InfoBanner = ({content, title, iconSize = 30}: Props) => {
  const {palette: p} = useTheme()

  const styles = StyleSheet.create({
    notice: {
      backgroundColor: p.sys_cyan_100,
      ...a.p_md,
      borderRadius: 8,
    },
    text: {
      ...a.body_2_md_regular,
      color: p.gray_max,
    },
    titleContainer: {
      ...a.flex_row,
      ...a.align_center,
    },
    title: {
      color: p.text_gray_max,
      ...a.body_2_md_medium,
    },
  })

  return (
    <View style={styles.notice}>
      <View style={styles.titleContainer}>
        <Icon.Info size={iconSize} color={p.primary_500} />

        <Space.Width.sm />

        {title != null && <Text style={styles.title}>{title}</Text>}
      </View>

      <Space.Height.sm />

      <Text style={styles.text}>{content}</Text>
    </View>
  )
} 