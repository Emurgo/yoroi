import {fromPairs} from 'lodash'
import DeviceInfo from 'react-native-device-info'

import {ApiHistoryError} from '../../../legacy/errors'
import {storage as rootStorage, YoroiStorage} from '../../storage'
import type {Transaction} from '../../types/other'
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
import {makeTxCacheStorage, syncTxs, toCachedTx, TransactionCache} from './transactionCache'

describe('transactionCache', () => {
  describe('create', () => {
    it('loads from storage', async () => {
      DeviceInfo.getVersion = () => '9.9.9'
      const txCache = await TransactionCache.create(mockStorage)

      expect(txCache.transactions).toMatchSnapshot()
      expect(txCache.perAddressTxs).toMatchSnapshot()
      expect(txCache.perRewardAddressCertificates).toMatchSnapshot()
      expect(txCache.confirmationCounts).toMatchSnapshot()

      txCache.resetState()

      expect(txCache.transactions).toMatchSnapshot()
      expect(txCache.perAddressTxs).toMatchSnapshot()
      expect(txCache.perRewardAddressCertificates).toMatchSnapshot()
      expect(txCache.confirmationCounts).toMatchSnapshot()
    })

    it('starts fresh if txids is invalid format', async () => {
      DeviceInfo.getVersion = () => '9.9.9'

      const txCache = await TransactionCache.create({
        ...mockStorage,
        getItem: async (path: string) => {
          if (path !== 'txids') {
            throw new Error('invalid path')
          }
          return undefined // invalid txids
        },
      })

      expect(txCache.transactions).toMatchSnapshot()
      expect(txCache.perAddressTxs).toMatchSnapshot()
      expect(txCache.perRewardAddressCertificates).toMatchSnapshot()
      expect(txCache.confirmationCounts).toMatchSnapshot()
    })

    it('drops transaction if invalid format', async () => {
      DeviceInfo.getVersion = () => '9.9.9'
      const txCache = await TransactionCache.create({
        ...mockStorage,
        multiGet: async (paths: Array<string>) => {
          if (paths.length === 1 && paths[0] === mockTx.id) {
            return [[mockTx.id, undefined] as [string, undefined]]
          }
          throw new Error('invalid path')
        },
      })

      expect(txCache.transactions).toMatchSnapshot()
      expect(txCache.perAddressTxs).toMatchSnapshot()
      expect(txCache.perRewardAddressCertificates).toMatchSnapshot()
      expect(txCache.confirmationCounts).toMatchSnapshot()
    })

    it('starts fresh if upgrading from old version', async () => {
      DeviceInfo.getVersion = () => '0.0.1'
      const txCache = await TransactionCache.create(mockStorage)

      expect(txCache.transactions).toMatchSnapshot()
      expect(txCache.perAddressTxs).toMatchSnapshot()
      expect(txCache.perRewardAddressCertificates).toMatchSnapshot()
      expect(txCache.confirmationCounts).toMatchSnapshot()
    })
  })
})

describe('transaction storage', () => {
  it('works', async () => {
    const storage = rootStorage.join('txs/')
    const {loadTxs, saveTxs, clear} = makeTxCacheStorage(storage)

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
})

const mockStorage: YoroiStorage = {
  getItem: async (path: string) => {
    if (path === 'txids') return [mockTx.id]
    throw new Error('invalid path')
  },
  multiGet: async (txids: Array<string>) => {
    if (txids[0] !== mockTx.id) throw new Error('invalid path')

    return [
      [txids[0], mockTx] as [string, Transaction], //
    ]
  },
  join: () => mockStorage,
  setItem: jest.fn(),
  multiSet: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}

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
