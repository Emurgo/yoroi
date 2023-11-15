import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {rootStorage, StorageProvider} from '@yoroi/common'
import React from 'react'

import {CreatePinScreen} from './CreatePinScreen'

storiesOf('CreatePinScreen', module).add('Default', () => {
  return (
    <StorageProvider
      storage={{
        ...rootStorage,
      }}
    >
      <CreatePinScreen onDone={() => action('onDone')} />
    </StorageProvider>
  )
})
