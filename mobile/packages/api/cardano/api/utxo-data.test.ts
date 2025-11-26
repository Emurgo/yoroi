import {Api} from '@yoroi/types'

import {
  getUtxoData,
  isUtxosDataResponse,
  parseUtxoDataResponse,
} from './utxo-data'

const mockFetcher = jest.fn()

describe('getUtxoData', () => {
  const baseUrl = 'https://example.com'
  const txHash = 'abcd1234'
  const txIndex = 0

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and returns valid UTXO data', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {'$lovelaces': '1000000', 'policy1.asset1': '50'},
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(mockFetcher).toHaveBeenCalledWith({
      url: `${baseUrl}/transactions/${txHash}`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })

    expect(result.output.address).toBe('addr1qxyz')
    expect(result.output.amount).toBe('1000000')
    expect(result.output.assets).toHaveLength(1)
    expect(result.output.assets[0]?.assetId).toBe('policy1.asset1')
  })

  it('rejects if output index is out of bounds', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)

    await expect(fetchUtxo({txHash, txIndex: 999})).rejects.toThrow(
      'Output at index 999 not found',
    )
  })

  it('handles fetcher errors gracefully', async () => {
    mockFetcher.mockRejectedValue(new Error('Network error'))

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)

    await expect(fetchUtxo({txHash, txIndex})).rejects.toThrow('Network error')
    expect(mockFetcher).toHaveBeenCalled()
  })

  it('handles asset amounts with different types', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {
            '$lovelaces': '1000000',
            'policy1.asset1': '50', // string
            'policy2.asset2': 100, // number
            'policy3.asset3': 200n, // bigint
            'policy4.asset4': null, // null
            'policy5.asset5': undefined, // undefined
          },
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.assets).toHaveLength(5)
    expect(
      result.output.assets.find((a) => a.assetId === 'policy1.asset1')?.amount,
    ).toBe('50')
    expect(
      result.output.assets.find((a) => a.assetId === 'policy2.asset2')?.amount,
    ).toBe('100')
    expect(
      result.output.assets.find((a) => a.assetId === 'policy3.asset3')?.amount,
    ).toBe('200')
    expect(
      result.output.assets.find((a) => a.assetId === 'policy4.asset4')?.amount,
    ).toBe('0')
    expect(
      result.output.assets.find((a) => a.assetId === 'policy5.asset5')?.amount,
    ).toBe('0')
  })

  it('handles output with datumHash', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {$lovelaces: '1000000'},
          index: 0,
          datumHash: 'datum123',
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.dataHash).toBe('datum123')
  })

  it('handles output without $lovelaces', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {'policy1.asset1': '50'},
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.amount).toBe('0')
  })

  it('handles assetId without dot separator', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {$lovelaces: '1000000', policyonly: '100'},
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.assets).toHaveLength(1)
    expect(result.output.assets[0]?.policyId).toBe('policyonly')
    expect(result.output.assets[0]?.name).toBe('')
  })

  it('handles output without datumHash', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {$lovelaces: '1000000'},
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.dataHash).toBeNull()
  })

  it('handles asset amount with unexpected type (object)', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {
            '$lovelaces': '1000000',
            'policy1.asset1': {unexpected: 'type'} as any, // object type
          },
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.assets).toHaveLength(1)
    expect(
      result.output.assets.find((a) => a.assetId === 'policy1.asset1')?.amount,
    ).toBe('0')
  })

  it('handles asset amount with boolean type', async () => {
    const mockTxResponse = {
      hash: txHash,
      block: 'block123',
      inputs: [],
      outputs: [
        {
          address: 'addr1qxyz',
          amount: {
            '$lovelaces': '1000000',
            'policy1.asset1': true as any, // boolean type
          },
          index: 0,
        },
      ],
      fee: {},
      certificates: [],
      withdrawals: [],
      when: '2023-01-01T00:00:00Z',
    }
    mockFetcher.mockResolvedValue(mockTxResponse)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(result.output.assets).toHaveLength(1)
    expect(
      result.output.assets.find((a) => a.assetId === 'policy1.asset1')?.amount,
    ).toBe('0')
  })
})

describe('parseUtxoDataResponse', () => {
  const validData: Api.Cardano.UtxoData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [
        {assetId: '1', policyId: 'policy1', name: 'asset1', amount: '50'},
      ],
    },
    spendingTxHash: null,
  }

  const invalidData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [{assetId: '1', policyId: 'policy1', name: 'asset1'}],
    },
    spendingTxHash: null,
  }

  it('returns valid UTXO data if input matches schema', () => {
    const result = parseUtxoDataResponse(validData)
    expect(result).toEqual(validData)
  })

  it('returns undefined if input does not match schema', () => {
    const result = parseUtxoDataResponse(invalidData as any)
    expect(result).toBeUndefined()
  })
})

describe('isUtxosDataResponse', () => {
  const validData: Api.Cardano.UtxoData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [
        {assetId: '1', policyId: 'policy1', name: 'asset1', amount: '50'},
      ],
    },
    spendingTxHash: null,
  }

  const invalidData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [{assetId: '1', policyId: 'policy1', name: 'asset1'}],
    },
    spendingTxHash: null,
  }

  it('validates correct UTXO data structure', () => {
    const result = isUtxosDataResponse(validData)
    expect(result).toBe(true)
  })

  it('returns false for invalid UTXO data structure', () => {
    const result = isUtxosDataResponse(invalidData as any)
    expect(result).toBe(false)
  })

  it('returns false for completely unrelated data', () => {
    const unrelatedData = {someKey: 'someValue'}
    const result = isUtxosDataResponse(unrelatedData as any)
    expect(result).toBe(false)
  })
})

it('no deps for coverage', () => {
  const tokenSupply = getUtxoData('https://localhost')
  expect(tokenSupply).toBeDefined()
})
