import {Api} from '@yoroi/types'

import {
  getUtxoData,
  parseUtxoDataResponse,
  isUtxosDataResponse,
} from './utxo-data'

const mockFetcher = jest.fn()

describe('getUtxoData', () => {
  const baseUrl = 'https://example.com'
  const txHash = 'abcd1234'
  const txIndex = 0

  const validUtxoData: Api.Cardano.UtxoData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [
        {assetId: '1', policyId: 'policy1', name: 'asset1', amount: '50'},
        {assetId: '2', policyId: 'policy2', name: 'asset2', amount: '100'},
      ],
    },
    spendingTxHash: null,
  }

  const invalidUtxoData = {
    output: {
      address: 'addr1qxyz',
      amount: '1000000',
      dataHash: null,
      assets: [{assetId: '1', policyId: 'policy1', name: 'asset1'}],
    },
    spendingTxHash: null,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and returns valid UTXO data', async () => {
    mockFetcher.mockResolvedValue(validUtxoData)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)
    const result = await fetchUtxo({txHash, txIndex})

    expect(mockFetcher).toHaveBeenCalledWith({
      url: `${baseUrl}/api/txs/io/${txHash}/o/${txIndex}`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })

    expect(result).toEqual(validUtxoData)
  })

  it('rejects if UTXO data is invalid', async () => {
    mockFetcher.mockResolvedValue(invalidUtxoData)

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)

    await expect(fetchUtxo({txHash, txIndex})).rejects.toThrow(
      'Invalid utxo data response',
    )
    expect(mockFetcher).toHaveBeenCalled()
  })

  it('handles fetcher errors gracefully', async () => {
    mockFetcher.mockRejectedValue(new Error('Network error'))

    const fetchUtxo = getUtxoData(baseUrl, mockFetcher)

    await expect(fetchUtxo({txHash, txIndex})).rejects.toThrow('Network error')
    expect(mockFetcher).toHaveBeenCalled()
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
