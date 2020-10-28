// @flow
import React from 'react'
import {HeaderBackButton} from 'react-navigation-stack'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

type Props = {
  navigation: any, // TODO: type
  shouldPopOutOfLastNavigator?: boolean,
}

export default ({navigation, shouldPopOutOfLastNavigator}: Props) => (
  <HeaderBackButton
    tintColor="white"
    onPress={() => {
      if (shouldPopOutOfLastNavigator === true) {
        navigation.popToTop()
      } else {
        navigation.goBack(null)
      }
    }}
  />
)
