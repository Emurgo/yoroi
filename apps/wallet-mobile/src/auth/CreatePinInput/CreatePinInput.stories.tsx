import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {rootStorage, StorageProvider} from '@yoroi/common'
import React from 'react'

import {CreatePinInput} from './CreatePinInput'

storiesOf('CreatePinInput', module).add('Default', () => (
  <StorageProvider
    storage={{
      ...rootStorage,
      setItem: (key: string, data: unknown) => {
        action('setItem')(key, data)
        return Promise.resolve()
      },
    }}
  >
    <CreatePinInput onDone={action('onDone')} />
  </StorageProvider>
))
