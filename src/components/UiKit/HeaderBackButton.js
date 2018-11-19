// @flow
import React from 'react'
import {HeaderBackButton} from 'react-navigation-stack'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  shouldPopOutOfLastNavigator?: boolean,
}

export default ({navigation, shouldPopOutOfLastNavigator}: Props) => (
  <HeaderBackButton
    tintColor="white"
    onPress={() => {
      if (shouldPopOutOfLastNavigator) {
        // $FlowFixMe
        navigation.popToTop()
      } else {
        navigation.goBack(null)
      }
    }}
  />
)
