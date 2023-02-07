import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'

import {storage as rootStorage, YoroiStorage} from '../storage'
import {Transaction} from '../types'
import {
  mockedAddressesByChunks,
  mockedBackendConfig,
  mockedEmptyHistoryResponse,
  mockedHistoryResponse,
  mockedTipStatusResponse,
  mockTx,
} from './mocks'
import {makeTransactionManager} from './transactionManager'

jest.mock('./api', () => ({
  getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
  fetchNewTxHistory: jest
    .fn()
    .mockResolvedValueOnce(mockedHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse),
}))

describe('transaction manager', () => {
  beforeEach(() => AsyncStorage.clear())

  it('New schema: Empty storage, Sync, Memo', async () => {
    DeviceInfo.getVersion = () => '9.9.9'
    const txManager = await makeTransactionManager(rootStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toMatchSnapshot()
    expect(txManager.getPerAddressTxs()).toMatchSnapshot()
    expect(txManager.getPerRewardAddressCertificates()).toMatchSnapshot()

    // tx cache mutation
    await txManager.doSync(mockedAddressesByChunks)

    expect(txManager.getTransactions()).toMatchSnapshot()
    expect(txManager.getPerAddressTxs()).toMatchSnapshot()
    expect(txManager.getPerRewardAddressCertificates()).toMatchSnapshot()

    await txManager.saveMemo('54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddg', 'memo 1')

    expect(txManager.getTransactions()['54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddg'].memo).toBe(
      'memo 1',
    )
  })

  it('New schema: Non empty storage', async () => {
    DeviceInfo.getVersion = () => '9.9.9'
    const txManager = await makeTransactionManager(mockStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})
  })

  it('Old schema: Non empty storage', async () => {
    DeviceInfo.getVersion = () => '0.0.1'
    const txManager = await makeTransactionManager(mockStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toEqual({})
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
