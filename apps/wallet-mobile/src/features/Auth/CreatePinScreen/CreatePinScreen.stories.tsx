import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {AsyncStorageProvider} from '@yoroi/common'
import React from 'react'

import {rootStorage} from '../../../yoroi-wallets/storage/rootStorage'
import {CreatePinScreen} from './CreatePinScreen'

storiesOf('CreatePinScreen', module).add('Default', () => {
  return (
    <AsyncStorageProvider
      storage={{
        ...rootStorage,
      }}
    >
      <CreatePinScreen onDone={() => action('onDone')} />
    </AsyncStorageProvider>
  )
})
