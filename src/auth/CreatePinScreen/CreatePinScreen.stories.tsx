import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {StorageProvider} from '../../Storage'
import {storage} from '../../yoroi-wallets/storage'
import {CreatePinScreen} from './CreatePinScreen'

storiesOf('CreatePinScreen', module).add('Default', () => {
  return (
    <StorageProvider
      storage={{
        ...storage,
      }}
    >
      <CreatePinScreen onDone={() => action('onDone')} />
    </StorageProvider>
  )
})
