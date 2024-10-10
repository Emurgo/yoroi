import * as React from 'react'
import {ImageStyle, StyleProp, View} from 'react-native'

type Props = {
  style: StyleProp<ImageStyle>
}
export const AssetLogo = ({children, style}: React.PropsWithChildren<Props>) => {
  return <View style={[style]}>{children}</View>
}
