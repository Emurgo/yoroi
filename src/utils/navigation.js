// @flow

import {COLORS} from '../styles/config'
import HeaderBackButton from '../components/UiKit/HeaderBackButton'
import React from 'react'

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

// $FlowFixMe Missing type annotation for destructing
export const backButtonNavigatorOptions = ({navigation}) => ({
  title: navigation.getParam('title'),
  // Nested stack navigators have problems with back button
  // https://github.com/react-navigation/react-navigation/issues/115
  headerLeft: <HeaderBackButton navigation={navigation} />,
  ...defaultNavigationOptions,
})
