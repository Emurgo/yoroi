import AsyncStorage from '@react-native-async-storage/async-storage'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {StorageProvider} from '../../Storage'
import {CreatePinScreen} from './CreatePinScreen'

storiesOf('CreatePinScreen', module).add('Default', () => {
  return (
    <StorageProvider
      storage={{
        ...AsyncStorage,
      }}
    >
      <CreatePinScreen onDone={() => action('onDone')} />
    </StorageProvider>
  )
})
