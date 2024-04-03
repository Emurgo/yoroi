import {storiesOf} from '@storybook/react-native'
import {AsyncStorageProvider} from '@yoroi/common'
import * as React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {rootStorage} from '../../../../yoroi-wallets/storage/rootStorage'
import {SingleOrMultipleAddressesModal} from './SingleOrMultipleAddressesModal'

storiesOf('Receive SingleOrMultipleAddressesModal', module).add('default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <AsyncStorageProvider
      storage={{
        ...rootStorage,
        join: (joinKey) => {
          const joined = rootStorage.join(joinKey)
          return {
            ...joined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getItem: async (key, parser): Promise<any> => {
              if (key === mocks.wallet.id) {
                return mocks.walletMeta
              }
              return joined.getItem(key, parser)
            },
          }
        },
      }}
    >
      <SingleOrMultipleAddressesModal />
    </AsyncStorageProvider>
  </SelectedWalletProvider>
))
