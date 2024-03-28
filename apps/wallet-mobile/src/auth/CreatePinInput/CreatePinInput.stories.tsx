import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {AsyncStorageProvider} from '@yoroi/common'
import React from 'react'

import {rootStorage} from '../../yoroi-wallets/storage/rootStorage'
import {CreatePinInput} from './CreatePinInput'

storiesOf('CreatePinInput', module).add('Default', () => (
  <AsyncStorageProvider
    storage={{
      ...rootStorage,
      setItem: (key: string, data: unknown) => {
        action('setItem')(key, data)
        return Promise.resolve()
      },
    }}
  >
    <CreatePinInput onDone={action('onDone')} />
  </AsyncStorageProvider>
))
