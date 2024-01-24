import React from 'react'
import {Platform} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {COLORS} from './theme'

const GradientHeader = () => <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={['#1A44B7', '#F14D78']} />

export const defaultNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND_BLUE,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#fff',
} as const

export const defaultStackNavigatorOptions = {
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 8 : undefined,
  },
} as const

export const jormunNavigationOptions = {
  headerBackground: () => <GradientHeader />,
} as const
