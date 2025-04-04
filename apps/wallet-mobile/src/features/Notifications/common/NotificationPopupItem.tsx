import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../../../components/Text'

type Props = {
  onPress?: () => void
  icon: React.ReactNode
  title: string
  description: string
}

export const NotificationItem = ({onPress, icon, title, description}: Props) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {icon}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color, isLight} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: 76,
      borderRadius: 6,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      ...atoms.flex_row,
      ...atoms.border,
      backgroundColor: isLight ? color.bg_color_max : color.gray_100,
      borderColor: color.gray_50,
      shadowColor: isLight ? '#8A92A31A' : '#24283833',
      shadowOffset: {width: -1, height: 8},
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    content: {
      ...atoms.flex_col,
      ...atoms.gap_xs,
    },
    title: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
    },
    description: {
      ...atoms.link_2_md,
      color: color.gray_600,
    },
  })

  return {styles, colors: {iconColor: color.secondary_600, iconBackground: color.secondary_100}}
}
