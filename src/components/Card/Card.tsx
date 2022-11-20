import React from 'react'
import {View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export const Card = (props: ViewProps) => {
  const {children, ...viewProps} = props
  return (
    <View {...viewProps}>
      <LinearGradient
        style={{flex: 1, borderRadius: 8, padding: 16}}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={['#244ABF', '#4760FF']}
      >
        {children}
      </LinearGradient>
    </View>
  )
}
