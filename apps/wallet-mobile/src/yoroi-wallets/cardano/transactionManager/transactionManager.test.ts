import AsyncStorage from '@react-native-async-storage/async-storage'
import {fromPairs} from 'lodash'
import DeviceInfo from 'react-native-device-info'

import {rootStorage} from '../../storage/rootStorage'
import {ApiHistoryError} from '../errors'
import {
  mockedAddressesByChunks,
  mockedBackendConfig,
  mockedEmptyHistoryResponse,
  mockedEmptyLocalTransactions,
  mockedHistoryResponse,
  mockedLocalTransactions,
  mockedTipStatusResponse,
  mockTx,
} from '../mocks'
import {makeTxManagerStorage, syncTxs, toCachedTx, TransactionManager} from './transactionManager'

jest.mock('../api', () => ({
  getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
  fetchNewTxHistory: jest
    .fn()
    .mockResolvedValueOnce(mockedHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse),
}))

beforeEach(() => AsyncStorage.clear())

describe('transactionManager', () => {
  it('restore, resetState, sync', async () => {
    DeviceInfo.getVersion = () => '9.9.9'

    const mockStorage = rootStorage.join('txs/')
    mockStorage.multiSet([
      [mockTx.id, mockTx],
      ['txids', [mockTx.id]],
    ])

    const txManager = await TransactionManager.create(mockStorage)

    expect(txManager.transactions).toMatchSnapshot()
    expect(txManager.perAddressTxs).toMatchSnapshot()
    expect(txManager.perRewardAddressCertificates).toMatchSnapshot()
    expect(txManager.confirmationCounts).toMatchSnapshot()

    txManager.resetState()

    expect(txManager.transactions).toEqual({})
    expect(txManager.perAddressTxs).toEqual({})
    expect(txManager.perRewardAddressCertificates).toEqual({})
    expect(txManager.confirmationCounts).toEqual({})

    await txManager.doSync(mockedAddressesByChunks, mockedBackendConfig)

    expect(txManager.transactions).toMatchSnapshot()
    expect(txManager.perAddressTxs).toMatchSnapshot()
    expect(txManager.perRewardAddressCertificates).toMatchSnapshot()
  })
})

describe('transaction storage', () => {
  it('works', async () => {
    const storage = rootStorage.join('txs/')
    const {loadTxs, saveTxs, clear} = makeTxManagerStorage(storage)

    // initial
    await loadTxs().then((txs) => {
      return expect(txs).toEqual({})
    })

    await saveTxs({[mockTx.id]: mockTx})
    await loadTxs().then((txs) => {
      return expect(txs).toEqual({[mockTx.id]: mockTx})
    })

    await clear()
    await loadTxs().then((txs) => {
      return expect(txs).toEqual({})
    })
  })

  it('drops transaction if invalid format', async () => {
    const storage = rootStorage.join('txs/')
    storage.multiSet([
      [mockTx.id, undefined],
      ['txids', [mockTx.id]],
    ])

    const {loadTxs} = makeTxManagerStorage(storage)

    await loadTxs().then((txs) => {
      return expect(txs).toEqual({})
    })
  })

  it('starts fresh if txids is invalid format', async () => {
    const storage = rootStorage.join('txs/')
    storage.multiSet([
      [mockTx.id, mockTx],
      ['txids', undefined],
    ])

    const {loadTxs} = makeTxManagerStorage(storage)

    await loadTxs().then((txs) => {
      return expect(txs).toEqual({})
    })
  })
})

describe('syncTxs (undefined means no updates)', () => {
  it('should return undefined if tipStatus bestBlock.hash is empty', async () => {
    const params = {
      addressesByChunks: [],
      backendConfig: mockedBackendConfig,
      transactions: mockedEmptyLocalTransactions,
      api: {
        getTipStatus: jest.fn().mockResolvedValue({
          safeBlock: mockedTipStatusResponse.safeBlock,
          bestBlock: {...mockedTipStatusResponse.bestBlock, hash: ''},
        }),
        fetchNewTxHistory: jest.fn(),
      },
    }

    const result = await syncTxs(params)

    expect(result).toBeUndefined()
    expect(params.api.getTipStatus).toBeCalledTimes(1)
  })

  it('should return undefined if there is no new transactions', async () => {
    const params = {
      addressesByChunks: mockedAddressesByChunks,
      backendConfig: mockedBackendConfig,
      transactions: mockedLocalTransactions,
      api: {
        getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
        fetchNewTxHistory: jest
          .fn()
          .mockResolvedValueOnce(mockedEmptyHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse),
      },
    }

    const result = await syncTxs(params)

    expect(result).toBeUndefined()
    expect(params.api.fetchNewTxHistory).toBeCalledTimes(3)
  })

  it('should return current txs plus new txs if there are new transactions', async () => {
    const params = {
      addressesByChunks: mockedAddressesByChunks,
      backendConfig: mockedBackendConfig,
      transactions: mockedLocalTransactions,
      api: {
        getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
        fetchNewTxHistory: jest
          .fn()
          .mockResolvedValueOnce(mockedHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse),
      },
    }
    const response = {
      ...mockedLocalTransactions,
      ...fromPairs(mockedHistoryResponse.transactions.map((t) => [t.hash, toCachedTx(t)])),
    }

    const result = await syncTxs(params)

    expect(result).toEqual(response)
    expect(params.api.fetchNewTxHistory).toBeCalledTimes(3)
  })

  it('should return current txs plus new txs if there are new transactions and continue to request while is not the last', async () => {
    const params = {
      addressesByChunks: [mockedAddressesByChunks[0]],
      backendConfig: mockedBackendConfig,
      transactions: {},
      api: {
        getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
        fetchNewTxHistory: jest
          .fn()
          .mockResolvedValueOnce({...mockedHistoryResponse, isLast: false})
          .mockResolvedValueOnce({...mockedHistoryResponse, isLast: false})
          .mockResolvedValueOnce({...mockedHistoryResponse, isLast: false})
          .mockResolvedValueOnce({...mockedHistoryResponse, isLast: false})
          .mockResolvedValueOnce(mockedEmptyHistoryResponse),
      },
    }
    const response = fromPairs(mockedHistoryResponse.transactions.map((t) => [t.hash, toCachedTx(t)]))

    const result = await syncTxs(params)

    expect(result).toEqual(response)
    expect(params.api.fetchNewTxHistory).toBeCalledTimes(5)
  })

  it.each([ApiHistoryError.errors.REFERENCE_BLOCK_MISMATCH, ApiHistoryError.errors.REFERENCE_TX_NOT_FOUND])(
    `should return current txs minus txs after last_tx.height if receives %p`,
    async (error) => {
      const params = {
        addressesByChunks: mockedAddressesByChunks,
        backendConfig: mockedBackendConfig,
        transactions: {
          ...mockedLocalTransactions,
          ...fromPairs(mockedHistoryResponse.transactions.map((t) => [t.hash, toCachedTx(t)])),
        },
        api: {
          getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
          fetchNewTxHistory: jest
            .fn()
            .mockRejectedValueOnce(new ApiHistoryError(error))
            .mockResolvedValueOnce(mockedEmptyHistoryResponse)
            .mockResolvedValueOnce(mockedEmptyHistoryResponse),
        },
      }

      const result = await syncTxs(params)

      expect(result).toEqual(mockedLocalTransactions)
    },
  )

  it(`should return undefined if receives ${ApiHistoryError.errors.REFERENCE_BEST_BLOCK_MISMATCH}`, async () => {
    const params = {
      addressesByChunks: mockedAddressesByChunks,
      backendConfig: mockedBackendConfig,
      transactions: mockedLocalTransactions,
      api: {
        getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
        fetchNewTxHistory: jest
          .fn()
          .mockRejectedValueOnce(new ApiHistoryError(ApiHistoryError.errors.REFERENCE_BEST_BLOCK_MISMATCH))
          .mockResolvedValueOnce(mockedEmptyHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse),
      },
    }

    const result = await syncTxs(params)

    expect(result).toBeUndefined()
  })

  it(`should return undefined if receives any other error`, async () => {
    const params = {
      addressesByChunks: mockedAddressesByChunks,
      backendConfig: mockedBackendConfig,
      transactions: mockedLocalTransactions,
      api: {
        getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
        fetchNewTxHistory: jest
          .fn()
          .mockRejectedValueOnce(new Error('error'))
          .mockResolvedValueOnce(mockedEmptyHistoryResponse)
          .mockResolvedValueOnce(mockedEmptyHistoryResponse),
      },
    }

    const result = await syncTxs(params)

    expect(result).toBeUndefined()
  })
})
