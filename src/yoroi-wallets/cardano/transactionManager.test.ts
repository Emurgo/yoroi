import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'

import {storage as rootStorage} from '../storage'
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

  it('create', async () => {
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

  it('restore', async () => {
    DeviceInfo.getVersion = () => '9.9.9'
    const mockStorage = rootStorage.join('txs/')
    mockStorage.multiSet([
      [mockTx.id, mockTx],
      ['txids', [mockTx.id]],
    ])
    const txManager = await makeTransactionManager(rootStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toEqual({[mockTx.id]: mockTx})
  })

  it('deprecated schema', async () => {
    DeviceInfo.getVersion = () => '0.0.1'
    const mockStorage = rootStorage.join('txs/')
    mockStorage.multiSet([
      [mockTx.id, mockTx],
      ['txids', [mockTx.id]],
    ])
    const txManager = await makeTransactionManager(rootStorage, mockedBackendConfig)

    expect(txManager.getTransactions()).toEqual({})
  })
})
