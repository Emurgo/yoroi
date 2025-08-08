import {atoms as a, useTheme} from '@yoroi/theme'
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
  const {palette: p} = useTheme()

  return (
    <View style={[styles.notice, {backgroundColor: p.sys_yellow_100}]}>
      <View style={[a.flex_row, a.align_center]}>
        <Icon.Info size={iconSize} color={p.sys_orange_500} />

        <Space width="sm" />

        <Text style={[styles.title, {color: p.text_gray_max}]}>{title}</Text>
      </View>

      <Space height="sm" />

      <Text style={[styles.text, {color: p.gray_max}]}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notice: {
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
}) 