import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

type ContentResultProps = {
  title: string
  children: React.ReactNode
}

export const ContentResult = ({title, children}: ContentResultProps) => {
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_row, a.align_center, a.justify_between, a.w_full]}>
      <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>{title}</Text>

      <View>{children}</View>
    </View>
  )
}
