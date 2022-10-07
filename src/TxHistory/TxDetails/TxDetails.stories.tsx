import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, RouteProvider} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {TxDetails} from './TxDetails'

storiesOf('TxDetails', module).add('default', () => {
  return (
    <RouteProvider params={{id: '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'}}>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          transactions: {
            '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210': {
              id: '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210',
              type: 'shelley',
              fee: '168273',
              status: 'Successful',
              inputs: [
                {
                  address:
                    'addr_test1qzea0w2nrd8s6997fykqd8036ll9yw2nzlez9f78xr6v5vw0eme9lj7arv6qycm3t648w9r3t6hgguv7zgmlw0sjd8nsa2d5vr',
                  amount: '1000000000',
                  assets: [],
                },
              ],
              outputs: [
                {
                  address:
                    'addr_test1qzrj5gr2mxq2vsu5gzq3fu86f66jgef9zleq7u0waqjpf7w0eme9lj7arv6qycm3t648w9r3t6hgguv7zgmlw0sjd8nspefcy5',
                  amount: '100000000',
                  assets: [],
                },
                {
                  address:
                    'addr_test1qp7kthdh7a835chk0mhvqh3napkf5wkj97fhz97y758c3j70eme9lj7arv6qycm3t648w9r3t6hgguv7zgmlw0sjd8nszjr35r',
                  amount: '899831727',
                  assets: [],
                },
              ],
              lastUpdatedAt: '2021-05-18T20:33:37.000Z',
              submittedAt: '2021-05-18T20:33:37.000Z',
              blockNum: 2593777,
              blockHash: '2786e5cd8b7b43691f209e296253cd9be959608d1c5564c095b026cf8a0b547a',
              txOrdinal: 0,
              epoch: 132,
              slot: 346401,
              withdrawals: [],
              certificates: [],
              validContract: true,
              scriptSize: 0,
              collateralInputs: [],
            },
          },
        }}
      >
        <TxDetails />
      </SelectedWalletProvider>
    </RouteProvider>
  )
})
