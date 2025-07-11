import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../Text/Text'

type Props = {
  onPress?: () => void
  icon: React.ReactNode
  title: string
  description: string
}

export const NotificationItem = ({
  onPress,
  icon,
  title,
  description,
}: Props) => {
  const {color, isLight} = useTheme()
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {backgroundColor: isLight ? color.bg_color_max : color.gray_100},
        {borderColor: color.gray_50},
        {shadowColor: isLight ? '#8A92A31A' : '#24283833'},
      ]}
      onPress={onPress}
    >
      {icon}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 6,
    ...a.p_lg,
    ...a.gap_lg,
    ...a.flex_row,
    ...a.border,
    shadowOffset: {width: -1, height: 8},
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  content: {
    ...a.flex_1,
    ...a.flex_col,
    ...a.gap_xs,
  },
  title: {
    ...a.body_2_md_medium,
    ...a.font_semibold,
  },
  description: {
    ...a.link_2_md,
  },
})
