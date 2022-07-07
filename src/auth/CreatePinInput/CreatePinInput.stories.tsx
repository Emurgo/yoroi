import AsyncStorage from '@react-native-async-storage/async-storage'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {StorageProvider} from '../../Storage'
import {CreatePinInput} from './CreatePinInput'

storiesOf('CreatePinInput', module).add('Default', () => <CreatePinInputWrapper />)

const CreatePinInputWrapper = () => {
  const strings = useStrings()
  return (
    <StorageProvider
      storage={{
        ...AsyncStorage,
        setItem: (key: string, data: unknown) => {
          action('setItem')(key, data)
          return Promise.resolve()
        },
      }}
    >
      <CreatePinInput createPinStrings={strings.createPinStrings} onDone={action('onDone')} />
    </StorageProvider>
  )
}

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
})

const useStrings = () => {
  const intl = useIntl()

  return {
    createPinStrings: {
      title: intl.formatMessage(messages.pinInputTitle),
      subtitle: intl.formatMessage(messages.pinInputSubtitle),
      confirmationTitle: intl.formatMessage(messages.pinInputConfirmationTitle),
    },
  }
}
