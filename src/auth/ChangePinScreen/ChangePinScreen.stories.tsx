import AsyncStorage from '@react-native-async-storage/async-storage'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {StorageProvider} from '../../Storage'
import {ChangePinScreen} from './ChangePinScreen'

storiesOf('ChangePinScreen', module).add('Default', () => <ChangePinScreenWrapper />)

const ChangePinScreenWrapper = () => {
  const strings = useStrings()
  return (
    <StorageProvider
      storage={{
        ...AsyncStorage,
        getItem: async (key) => {
          action('getItem')(key)
          return encryptedKeyHash
        },
        setItem: async (key, data) => {
          action('setItem')(key, data)
        },
      }}
    >
      <ChangePinScreen
        createPinStrings={strings.createPinStrings}
        checkPinStrings={strings.checkPinStrings}
        onDone={action('onDone')}
      />
    </StorageProvider>
  )
}

// PIN = 111111
const encryptedKeyHash =
  '"6c66150921f7e47c5f0510b3eb1ca657b1b8242407c964cc20179d69e0f99e35acd44859dbdbc0dc7a9ac026e9168863f3d6884b55d70420170a9fa799b46d46665d1e7049bd85dc30193a850946cfe92370e53bda26ee2ccd19de986e81959b"'

const messages = defineMessages({
  pinInputTitle: {
    id: 'components.firstrun.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter the PIN',
  },
  pinInputSubtitle: {
    id: 'components.firstrun.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
  },
  pinInputConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
  currentPinInputTitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  currentPinInputSubtitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    createPinStrings: {
      title: intl.formatMessage(messages.pinInputTitle),
      subtitle: intl.formatMessage(messages.pinInputSubtitle),
      confirmationTitle: intl.formatMessage(messages.pinInputConfirmationTitle),
    },
    checkPinStrings: {
      title: intl.formatMessage(messages.currentPinInputTitle),
      subtitle: intl.formatMessage(messages.currentPinInputSubtitle),
    },
  }
}
