import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {storage, StorageProvider} from '../../yoroi-wallets/storage'
import {CreatePinInput} from './CreatePinInput'

storiesOf('CreatePinInput', module).add('Default', () => (
  <StorageProvider
    storage={{
      ...storage,
      setItem: (key: string, data: unknown) => {
        action('setItem')(key, data)
        return Promise.resolve()
      },
    }}
  >
    <CreatePinInput onDone={action('onDone')} />
  </StorageProvider>
))
