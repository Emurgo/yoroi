import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../storybook'
import {AddressVerifyModal} from './AddressVerifyModal'

const address =
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx'

storiesOf('AddressVerifyModal', module)
  .add('default', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB={false}
          address={address}
          isWaiting={false}
          path="this is the path"
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </WithModalProps>
  ))
  .add('isWaiting', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB={false}
          address={address}
          isWaiting
          path="this is the path"
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </WithModalProps>
  ))
  .add('useUSB', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB
          address={address}
          isWaiting={false}
          path="this is the path"
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </WithModalProps>
  ))
