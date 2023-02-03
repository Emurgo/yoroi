import {fromPairs} from 'lodash'
import DeviceInfo from 'react-native-device-info'

import {storage as rootStorage, YoroiStorage} from '../storage'
import {Transaction} from '../types'
import {mockApi, mockedAddressesByChunks, mockedBackendConfig, mockedHistoryResponse, mockTx} from './mocks'
import {perAddressTxsSelector, toCachedTx} from './shelley'
import {makeMemosManager, makeTransactionManager} from './transactionManager'

jest.mock('./api', () => mockApi)

describe('transaction manager', () => {
  DeviceInfo.getVersion = () => '9.9.9'

  let txManager
  beforeEach(async () => {
    txManager = await makeTransactionManager(mockStorage, mockedBackendConfig)
  })

  afterEach(rootStorage.clear)

  it('stores memos', async () => {
    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})

    await txManager.saveMemo(mockTx.id, 'memo 1')

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: {...mockTx, memo: 'memo 1'}})
  })

  it('gets updated tx cache values', async () => {
    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})
    expect(txManager.getPerAddressTxs()).toEqual(
      perAddressTxsSelector({
        transactions: {[mockTx.id]: mockTx},
        perAddressSyncMetadata: {},
        bestBlockNum: null,
      }),
    )
    expect(txManager.getPerRewardAddressCertificates()).toEqual({
      e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae: {
        '0a8962dde362eef1f840defe6f916fdf9701ad53c7cb5dd4a74ab85df8e9bffc': {
          submittedAt: '2021-09-13T18:42:10.000Z',
          epoch: 156,
          certificates: [
            {
              kind: 'StakeDeregistration',
              rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
            },
          ],
        },
      },
    })

    // tx cache mutation
    await txManager.doSync(mockedAddressesByChunks)

    expect(txManager.getTransactions()).toEqual({
      [mockTx.id]: mockTx,
      ...fromPairs(mockedHistoryResponse.transactions.map((t) => [t.hash, toCachedTx(t)])),
    })
    expect(txManager.getPerAddressTxs()).toEqual(
      perAddressTxsSelector({
        transactions: {
          [mockTx.id]: mockTx,
          ...fromPairs(mockedHistoryResponse.transactions.map((t) => [t.hash, toCachedTx(t)])),
        },
        perAddressSyncMetadata: {},
        bestBlockNum: null,
      }),
    )
    expect(txManager.getPerRewardAddressCertificates()).toEqual({
      e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae: {
        '0a8962dde362eef1f840defe6f916fdf9701ad53c7cb5dd4a74ab85df8e9bffc': {
          submittedAt: '2021-09-13T18:42:10.000Z',
          epoch: 156,
          certificates: [
            {
              kind: 'StakeDeregistration',
              rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
            },
          ],
        },
        '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddg': {
          submittedAt: '2022-06-12T23:46:47.000Z',
          epoch: 210,
          certificates: [
            {
              kind: 'StakeRegistration',
              rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
            },
            {
              kind: 'StakeDelegation',
              poolKeyHash: '8a77ce4ffc0c690419675aa5396df9a38c9cd20e36483d2d2465ce86',
              rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
            },
          ],
        },
      },
    })
  })
})

describe('memos manager', () => {
  it('works', async () => {
    const storage = rootStorage.join('memos/')
    const memosManager = await makeMemosManager(storage)

    expect(memosManager.getMemos()).toEqual({})

    await memosManager.saveMemo('fake-tx-id-1', 'Send money to my friend')
    await memosManager.saveMemo('fake-tx-id-2', 'Send money to my girlfriend')

    expect(memosManager.getMemos()).toEqual({
      'fake-tx-id-1': 'Send money to my friend',
      'fake-tx-id-2': 'Send money to my girlfriend',
    })

    await memosManager.clear()

    expect(memosManager.getMemos()).toEqual({})
  })
})

// mocks

const mockStorage: YoroiStorage = {
  join: (path) => {
    if (path === 'txs/') {
      return mockStorage
    }
    return rootStorage
  },
  multiGet: async (txids: Array<string>) => {
    if (txids[0] !== mockTx.id) throw new Error('invalid path')

    return [[txids[0], mockTx] as [string, Transaction]]
  },
  getItem: async (path: string) => {
    if (path === 'txids') return [mockTx.id]
    throw new Error('invalid path')
  },
  setItem: jest.fn(),
  multiSet: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}
