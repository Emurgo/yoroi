// @flow

import React from 'react'
import {View} from 'react-native'
import {Header} from 'react-navigation'
import LinearGradient from 'react-native-linear-gradient'
import {COLORS} from './styles/config'

const GradientHeader = (props) => (
  <View style={{backgroundColor: COLORS.LIGHT_GRAY}}>
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={['#1A44B7', '#F14D78']}
    >
      <Header {...props} />
    </LinearGradient>
  </View>
)

export const defaultNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND_BLUE,
    borderBottomWidth: 0,
  },
  headerTintColor: '#fff',
}

export const defaultStackNavigatorOptions = {
  headerLayoutPreset: 'center',
}

export const shelleyNavigationOptions = {
  header: (props) => <GradientHeader {...props} />,
  headerStyle: {
    backgroundColor: 'transparent',
  },
}
