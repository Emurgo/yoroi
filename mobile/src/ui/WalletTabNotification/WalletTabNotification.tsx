import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {View} from 'react-native'

type Props = {
  show: boolean
}

export const WalletTabNotification = ({show}: Props) => {
  const {palette: p} = useTheme()

  if (!show) {
    return null
  }

  return (
    <View
      style={[
        a.absolute,
        {
          top: -4,
          right: -4,
          width: 12,
          height: 12,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: p.gray_min,
          overflow: 'hidden',
        },
      ]}
    >
      <LinearGradient
        colors={p.bg_gradient_4}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  )
}

