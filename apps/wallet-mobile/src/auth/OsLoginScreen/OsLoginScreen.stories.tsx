import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {RouteProvider} from '../../../.storybook/decorators'
import {OsLoginScreen} from './OsLoginScreen'

storiesOf('OsLoginScreen', module)
  .add('Default', () => (
    <RouteProvider
      params={{
        onSuccess: action('onSuccess'),
      }}
    >
      <OsLoginScreen />
    </RouteProvider>
  ))
  .add('With custom instructions', () => (
    <RouteProvider
      params={{
        onSuccess: action('onSuccess'),
        instructions: ['Please authWithOs so that Yoroi can build your transaction'],
      }}
    >
      <OsLoginScreen />
    </RouteProvider>
  ))
