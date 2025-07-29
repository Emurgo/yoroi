import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Text} from '~/ui/Text/Text'

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
  const {palette: p, isLight} = useTheme()
  return (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          borderRadius: 6,
          shadowOffset: {width: -1, height: 8},
          shadowOpacity: 1,
          shadowRadius: 20,
          backgroundColor: isLight ? p.bg_color_max : p.gray_100,
          borderColor: p.gray_50,
          shadowColor: isLight ? '#8A92A31A' : '#24283833',
        },
        a.p_lg,
        a.gap_lg,
        a.flex_row,
        a.border,
      ]}
      onPress={onPress}
    >
      {icon}

      <View style={[a.flex_1, a.flex_col, a.gap_xs]}>
        <Text style={[a.body_2_md_medium, a.font_semibold]}>{title}</Text>

        <Text style={[a.link_2_md]}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}
