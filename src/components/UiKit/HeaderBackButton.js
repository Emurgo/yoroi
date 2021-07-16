// @flow

import React from 'react'
import {HeaderBackButton} from '@react-navigation/stack'

// note: this component is not used anywhere, consider removing

type Props = {
  navigation: any,
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
