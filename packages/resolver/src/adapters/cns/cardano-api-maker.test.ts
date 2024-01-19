import {FetchData} from '@yoroi/common'
import {Left, Resolver} from '@yoroi/types'
import {makeCnsCardanoApi} from './cardano-api-maker'
import {CardanoApi} from '@yoroi/api'
import {inlineDatumMock, metadataMock} from './cardano-api-maker.mocks'

jest.mock('@yoroi/api')

describe('getAssetAddress', () => {
  it('returns the address', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'

    const responseMock = {
      tag: 'right',
      value: {
        data: ['fake-address'],
        status: 200,
      },
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetAddress} = makeCnsCardanoApi('https://localhost', request)

    const response = await getAssetAddress(policyId, assetName)

    expect(response).toBe('fake-address')
    expect(request).toHaveBeenCalledWith(
      {
        url: 'https://localhost/api/asset/accounts?policy=asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT&asset=kskskskskskskkskskskskksksk',
      },
      undefined,
    )
  })

  it('fails: api error', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'

    const error = new Error('fake-error')

    const responseMock: Left<unknown> = {
      tag: 'left',
      error,
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetAddress} = makeCnsCardanoApi('https://localhost', request)

    try {
      await getAssetAddress(policyId, assetName)

      fail('it should crash before')
    } catch (e: any) {
      expect(e.message).toBe(error.message)
    }
  })

  it('fails: invalid api response', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'

    const responseMock = {
      tag: 'right',
      value: {
        data: [123455],
        status: 200,
      },
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetAddress} = makeCnsCardanoApi('https://localhost', request)

    try {
      await getAssetAddress(policyId, assetName)

      fail('it should crash before')
    } catch (e: any) {
      expect(e).toBeInstanceOf(Resolver.Errors.NotFound)
    }
  })
})

describe('getMetadata', () => {
  it('returns the metadata', async () => {
    const policyId = 'policyId'
    const assetName = 'assetName'
    const id = `${policyId}.${assetName}`

    const getOnChainMetadatas = jest.fn(() =>
      Promise.resolve({[id]: {mintNftRecordSelected: metadataMock}}),
    )

    // @ts-ignore
    CardanoApi.getOnChainMetadatas.mockReturnValue(getOnChainMetadatas)

    const {getMetadata} = makeCnsCardanoApi('https://localhost')
    const result = await getMetadata(policyId, assetName)

    expect(result).toEqual(metadataMock)
  })

  it('returns undefined', async () => {
    const policyId = 'policyId'
    const assetName = 'assetName'

    const getOnChainMetadatas = jest.fn(() =>
      Promise.resolve({randomId: {mintNftRecordSelected: metadataMock}}),
    )

    // @ts-ignore
    CardanoApi.getOnChainMetadatas.mockReturnValue(getOnChainMetadatas)

    const {getMetadata} = makeCnsCardanoApi('https://localhost')
    const result = await getMetadata(policyId, assetName)

    expect(result).toBe(undefined)
  })

  it('fails: invalid respoonse', async () => {
    const policyId = 'policyId'
    const assetName = 'assetName'

    const getOnChainMetadatas = jest.fn(() =>
      Promise.resolve({randomId: {mintNftRecordSelected: 'invalid'}}),
    )

    // @ts-ignore
    CardanoApi.getOnChainMetadatas.mockReturnValue(getOnChainMetadatas)

    const {getMetadata} = makeCnsCardanoApi('https://localhost')

    try {
      await getMetadata(policyId, assetName)
      fail('it should crash before')
    } catch (e: any) {
      expect(e).toBeInstanceOf(Resolver.Errors.NotFound)
    }
  })
})

describe('getAssetInlineDatum', () => {
  it('returns the address', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'
    const addresses = ['fake-address']

    const responseMock = {
      tag: 'right',
      value: {
        data: inlineDatumMock,
        status: 200,
      },
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetInlineDatum} = makeCnsCardanoApi(
      'https://localhost',
      request,
    )

    const response = await getAssetInlineDatum(policyId, assetName, addresses)

    expect(response).toStrictEqual(inlineDatumMock[0]?.inline_datum.plutus_data)
    expect(request).toHaveBeenCalledWith(
      {
        url: 'https://localhost/api/txs/utxoForAddresses',
        method: 'post',
        data: {
          addresses,
          asset: {
            policy: 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
            name: 'kskskskskskskkskskskskksksk',
          },
        },
      },
      undefined,
    )
  })

  it('fails: api error', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'
    const addresses = ['fake-address']

    const error = new Error('fake-error')

    const responseMock: Left<unknown> = {
      tag: 'left',
      error,
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetInlineDatum} = makeCnsCardanoApi(
      'https://localhost',
      request,
    )

    try {
      await getAssetInlineDatum(policyId, assetName, addresses)

      fail('it should crash before')
    } catch (e: any) {
      expect(e.message).toBe(error.message)
    }
  })

  it('fails: invalid api response', async () => {
    const policyId = 'asset-hex-TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    const assetName = 'kskskskskskskkskskskskksksk'
    const addresses = ['fake-address']

    const responseMock = {
      tag: 'right',
      value: {
        data: 'invalid',
        status: 200,
      },
    }
    const request = jest.fn(() => Promise.resolve(responseMock)) as FetchData
    const {getAssetInlineDatum} = makeCnsCardanoApi(
      'https://localhost',
      request,
    )

    try {
      await getAssetInlineDatum(policyId, assetName, addresses)

      fail('it should crash before')
    } catch (e: any) {
      expect(e).toBeInstanceOf(Resolver.Errors.NotFound)
    }
  })
})
