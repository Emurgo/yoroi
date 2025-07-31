import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'

type ShowDisclaimerProps = {
  title: string
  children: React.ReactNode
}
export const ShowDisclaimer = ({title, children}: ShowDisclaimerProps) => {
  const {palette: p, atoms: a} = useTheme()

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
