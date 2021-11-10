// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import BiometricAuthScreen from './BiometricAuthScreen'

storiesOf('BiometricAuthScreen', module)
  .add('Default', ({route, navigation}) => {
    route.params = {
      onSuccess: () => ({}),
    }
    return <BiometricAuthScreen navigation={navigation} route={route} />
  })
  .add('With custom instructions', ({route, navigation}) => {
    route.params = {
      onSuccess: () => ({}),
      instructions: ['Please authenticate so that Yoroi can build your transaction'],
    }
    return <BiometricAuthScreen navigation={navigation} route={route} />
  })
