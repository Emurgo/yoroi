import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type Props = {content: React.ReactNode; iconSize?: number}

export const InfoBanner = ({content, iconSize = 30}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.notice}>
      <Icon.Info size={iconSize} color={colors.icon} />

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
      padding: 12,
      borderRadius: 8,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
  })

  const colors = {
    icon: color.primary_500,
  }

  return {colors, styles}
}
