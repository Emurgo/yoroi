// @flow

import React from 'react'
import {View} from 'react-native'
import {Header} from 'react-navigation'
import LinearGradient from 'react-native-linear-gradient'
import {COLORS} from './styles/config'

const GradientHeader = (props: any) => (
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

// note: the header option takes a HeaderProps object but it seems like this
// type is not exposed by the react-navigation library
export const shelleyNavigationOptions = {
  header: (props: any) => <GradientHeader {...props} />,
  headerStyle: {
    backgroundColor: 'transparent',
  },
}
