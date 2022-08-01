import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, WithModalProps} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {AddressModal} from './AddressModal'

const address =
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx'

storiesOf('AddressModal', module)
  .add('default', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <WithModalProps>
        {({visible, onRequestClose}) => (
          <AddressModal
            path={{
              account: 0,
              index: 1,
              role: 0,
            }}
            onAddressVerify={action('onAddressVerify')}
            address={address}
            visible={visible}
            onRequestClose={onRequestClose}
          />
        )}
      </WithModalProps>
    </SelectedWalletProvider>
  ))
  .add('isHW', () => (
    <SelectedWalletProvider wallet={{...mockWallet, isHW: true}}>
      <WithModalProps>
        {({visible, onRequestClose}) => (
          <AddressModal
            path={{
              account: 0,
              index: 1,
              role: 0,
            }}
            onAddressVerify={action('onAddressVerify')}
            address={address}
            visible={visible}
            onRequestClose={onRequestClose}
          />
        )}
      </WithModalProps>
    </SelectedWalletProvider>
  ))
  .add('without Path', () => (
    <SelectedWalletProvider wallet={{...mockWallet, isHW: true}}>
      <WithModalProps>
        {({visible, onRequestClose}) => (
          <AddressModal
            onAddressVerify={action('onAddressVerify')}
            address={address}
            visible={visible}
            onRequestClose={onRequestClose}
          />
        )}
      </WithModalProps>
    </SelectedWalletProvider>
  ))
