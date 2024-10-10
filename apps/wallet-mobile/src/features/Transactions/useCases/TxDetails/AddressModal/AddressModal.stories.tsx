import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {AddressModal} from './AddressModal'

const address =
  'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx'

storiesOf('AddressModal', module)
  .add('with path', () => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <AddressModal
        path={{
          account: 0,
          index: 1,
          role: 0,
        }}
        address={address}
      />
    </WalletManagerProviderMock>
  ))
  .add('without path', () => (
    <WalletManagerProviderMock wallet={{...mocks.wallet}}>
      <AddressModal address={address} />
    </WalletManagerProviderMock>
  ))
