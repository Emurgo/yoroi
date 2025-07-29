import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type ShowDisclaimerProps = {
  title: string
  children: React.ReactNode
}
export const ShowDisclaimer = ({title, children}: ShowDisclaimerProps) => {
  const {palette: p} = useTheme()

  return (
    <LinearGradient
      style={[{opacity: 1, borderRadius: 8}]}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      colors={p.bg_gradient_1}
    >
      <View style={[a.px_lg, a.py_md]}>
        <Text
          style={[
            a.body_1_lg_regular,
            a.font_semibold,
            {color: p.text_gray_max},
          ]}
        >
          {title}
        </Text>

        {children}
      </View>
    </LinearGradient>
  )
}
