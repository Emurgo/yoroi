// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ModalStoryWrapper} from '../../../storybook'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import AddressVerifyModal from './AddressVerifyModal'

const addressInfo = new AddressDTOCardano(
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
)

storiesOf('AddressVerifyModal', module)
  .add('default', () => (
    <ModalStoryWrapper>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB={false}
          addressInfo={addressInfo}
          isWaiting={false}
          path={'this is the path'}
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </ModalStoryWrapper>
  ))
  .add('isWaiting', () => (
    <ModalStoryWrapper>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB={false}
          addressInfo={addressInfo}
          isWaiting
          path={'this is the path'}
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </ModalStoryWrapper>
  ))
  .add('useUSB', () => (
    <ModalStoryWrapper>
      {({visible, onRequestClose}) => (
        <AddressVerifyModal
          useUSB
          addressInfo={addressInfo}
          isWaiting={false}
          path={'this is the path'}
          onConfirm={action('onConfirm')}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </ModalStoryWrapper>
  ))
