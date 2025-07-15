import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

type Props = {
  children: React.ReactNode
}

export const NotificationStack = ({children}: Props) => {
  return (
    <View style={[a.absolute, {top: 0, left: 0, right: 0}, a.z_50, a.px_lg]}>
      <SafeAreaView edges={['top']}>
        <View style={[a.gap_sm, a.flex_col]}>{children}</View>
      </SafeAreaView>
    </View>
  )
}
