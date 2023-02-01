import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {StorageProvider} from '../../Storage'
import {storage} from '../../yoroi-wallets/storage'
import {ChangePinScreen} from './ChangePinScreen'

storiesOf('ChangePinScreen', module).add('Default', () => {
  return (
    <StorageProvider
      storage={{
        ...storage,
        getItem: async (key) => {
          action('getItem')(key)
          return encryptedKeyHash
        },
        setItem: async (key, data) => {
          action('setItem')(key, data)
        },
      }}
    >
      <ChangePinScreen onDone={action('onDone')} />
    </StorageProvider>
  )
})

// PIN = 111111
const encryptedKeyHash =
  '"6c66150921f7e47c5f0510b3eb1ca657b1b8242407c964cc20179d69e0f99e35acd44859dbdbc0dc7a9ac026e9168863f3d6884b55d70420170a9fa799b46d46665d1e7049bd85dc30193a850946cfe92370e53bda26ee2ccd19de986e81959b"'
