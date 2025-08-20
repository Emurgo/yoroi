import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

type ShowDisclaimerProps = React.PropsWithChildren<{
  title: string
}>
export const ShowDisclaimer = ({title, children}: ShowDisclaimerProps) => {
  const {palette: p} = useTheme()

  return (
    <LinearGradient
      style={[{opacity: 1, borderRadius: 8}]}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      colors={p.bg_gradient_1}
    >
      <View style={[{paddingHorizontal: 16, paddingVertical: 12}]}>
        <Text
          style={[a.body_1_lg_regular, {color: p.gray_max, fontWeight: '500'}]}
        >
          {title}
        </Text>

        {children}
      </View>
    </LinearGradient>
  )
}
