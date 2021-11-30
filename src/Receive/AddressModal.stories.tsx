import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../storybook'
import {AddressModal} from './AddressModal'

const address =
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx'

storiesOf('AddressModal', module)
  .add('default', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <AddressModal
          index={1}
          walletMeta={{
            id: 'wallet-id',
            name: 'AsdasdA',
            networkId: 1,
            provider: '',
            walletImplementationId: 'haskell-shelley',
            checksum: {TextPart: 'adsdasddasd', ImagePart: 'asdasdasd'},
            isEasyConfirmationEnabled: false,
            isHW: false,
          }}
          onAddressVerify={action('onAddressVerify')}
          address={address}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </WithModalProps>
  ))
  .add('isHW', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <AddressModal
          index={1}
          walletMeta={{
            id: 'wallet-id',
            name: 'AsdasdA',
            networkId: 1,
            provider: '',
            walletImplementationId: 'haskell-shelley',
            checksum: {TextPart: 'adsdasddasd', ImagePart: 'asdasdasd'},
            isEasyConfirmationEnabled: false,
            isHW: true,
          }}
          onAddressVerify={action('onAddressVerify')}
          address={address}
          visible={visible}
          onRequestClose={onRequestClose}
        />
      )}
    </WithModalProps>
  ))
