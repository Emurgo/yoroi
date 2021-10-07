// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ModalStoryWrapper} from '../../../storybook'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import AddressModal from './AddressModal'

const addressInfo = new AddressDTOCardano(
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
)

storiesOf('AddressModal', module).add('default', () => (
  <ModalStoryWrapper>
    {({visible, onRequestClose}) => (
      <AddressModal
        onAddressVerify={action('onAddressVerify')}
        addressInfo={addressInfo}
        visible={visible}
        onRequestClose={onRequestClose}
      />
    )}
  </ModalStoryWrapper>
))
