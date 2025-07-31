import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type Props = {content: React.ReactNode; title?: string; iconSize?: number}

export const InfoBanner = ({content, title, iconSize = 30}: Props) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View
      style={[{backgroundColor: p.sys_cyan_100}, a.p_md, {borderRadius: 8}]}
    >
      <View style={[ta.flex_row, ta.align_center]}>
        <Icon.Info size={iconSize} color={p.primary_500} />

        <Space.Width.sm />

        {title != null && (
          <Text style={[a.body_2_md_medium, {color: p.text_gray_max}]}>
            {title}
          </Text>
        )}
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>{content}</Text>
    </View>
  )
}
