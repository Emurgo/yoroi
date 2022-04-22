import AsyncStorage from '@react-native-async-storage/async-storage'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {StorageProvider} from '../../Storage'
import {CreatePinInput} from './CreatePinInput'

storiesOf('CreatePinInput', module).add('Default', () => (
  <StorageProvider
    storage={{
      ...AsyncStorage,
      setItem: (key: string, data: unknown) => {
        action('setItem')(key, data)
        return Promise.resolve()
      },
    }}
  >
    <CreatePinInput onDone={action('onDone')} />
  </StorageProvider>
))
