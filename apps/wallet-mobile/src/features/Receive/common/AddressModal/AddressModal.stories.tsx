import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../../../.storybook/decorators'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/Context/SelectedWalletContext'
import {AddressModal} from './AddressModal'

const address =
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx'

storiesOf('AddressModal', module)
  .add('with path', () => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <WithModalProps>
        {({visible, onRequestClose}) => (
          <AddressModal
            path={{
              account: 0,
              index: 1,
              role: 0,
            }}
            address={address}
            visible={visible}
            onRequestClose={onRequestClose}
          />
        )}
      </WithModalProps>
    </SelectedWalletProvider>
  ))
  .add('without path', () => (
    <SelectedWalletProvider wallet={{...mocks.wallet}}>
      <WithModalProps>
        {({visible, onRequestClose}) => (
          <AddressModal address={address} visible={visible} onRequestClose={onRequestClose} />
        )}
      </WithModalProps>
    </SelectedWalletProvider>
  ))
