import DeviceInfo from 'react-native-device-info'

import {storage as rootStorage, YoroiStorage} from '../storage'
import {Transaction} from '../types'
import {mockApi, mockedAddressesByChunks, mockedBackendConfig, mockTx} from './mocks'
import {makeMemosManager, makeTransactionManager} from './transactionManager'

jest.mock('./api', () => mockApi)

describe('transaction manager', () => {
  DeviceInfo.getVersion = () => '9.9.9'

  afterEach(rootStorage.clear)

  it('stores memos', async () => {
    const txManager = await makeTransactionManager(mockStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})

    await txManager.saveMemo(mockTx.id, 'memo 1')

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: {...mockTx, memo: 'memo 1'}})
  })

  it('gets updated tx cache values', async () => {
    const txManager = await makeTransactionManager(mockStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toMatchSnapshot()
    expect(txManager.getPerAddressTxs()).toMatchSnapshot()
    expect(txManager.getPerRewardAddressCertificates()).toMatchSnapshot()

    // tx cache mutation
    await txManager.doSync(mockedAddressesByChunks)

    expect(txManager.getTransactions()).toMatchSnapshot()
    expect(txManager.getPerAddressTxs()).toMatchSnapshot()
    expect(txManager.getPerRewardAddressCertificates()).toMatchSnapshot()
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
