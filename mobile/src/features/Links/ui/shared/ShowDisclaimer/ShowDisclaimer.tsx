import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

type ShowDisclaimerProps = React.PropsWithChildren<{
  title: string
}>

export const ShowDisclaimer = ({title, children}: ShowDisclaimerProps) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <LinearGradient
      style={[a.rounded_sm]}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      colors={p.bg_gradient_1}
    >
      <View style={[a.px_lg, a.py_md]}>
        <Text style={[a.body_1_lg_regular, a.font_semibold, ta.text_gray_max]}>
          {title}
        </Text>

        {children}
      </View>
    </LinearGradient>
  )
}
