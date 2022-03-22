import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {RouteProvider} from '../../storybook'
import {BiometricAuthScreen} from './BiometricAuthScreen'

storiesOf('BiometricAuthScreen', module)
  .add('Default', () => (
    <RouteProvider
      params={{
        onSuccess: action('onSuccess'),
      }}
    >
      <BiometricAuthScreen />
    </RouteProvider>
  ))
  .add('With custom instructions', () => (
    <RouteProvider
      params={{
        onSuccess: action('onSuccess'),
        instructions: ['Please authenticate so that Yoroi can build your transaction'],
      }}
    >
      <BiometricAuthScreen />
    </RouteProvider>
  ))
