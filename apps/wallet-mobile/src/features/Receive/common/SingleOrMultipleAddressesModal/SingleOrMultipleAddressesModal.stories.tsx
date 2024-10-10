import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {AsyncStorageProvider} from '@yoroi/common'
import * as React from 'react'

import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SingleOrMultipleAddressesModal} from './SingleOrMultipleAddressesModal'

storiesOf('Receive SingleOrMultipleAddressesModal', module).add('default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
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
      <SingleOrMultipleAddressesModal onConfirm={action('onConfirm')} />
    </AsyncStorageProvider>
  </WalletManagerProviderMock>
))
