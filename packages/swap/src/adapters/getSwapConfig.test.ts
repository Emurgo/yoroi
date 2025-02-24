import {getSwapConfigApiMaker} from './getSwapConfig'
import {FetchData} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

const mockFetchData = (async ({url}: {url: string}) => {
  if (url !== undefined) {
    return freeze({
      tag: 'right' as const,
      value: {
        status: 200,
        data: {
          initialPair: {
            tokenIn: '.' as Portfolio.Token.Id,
            tokenOut:
              'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as Portfolio.Token.Id,
          },
        },
      },
    })
  }
  return freeze({
    tag: 'left',
    error: new Error('Network error'),
  })
}) as FetchData

describe('getSwapConfigApiMaker', () => {
  it('should return swap config data when the response is valid', async () => {
    const result = await getSwapConfigApiMaker({request: mockFetchData})()
    expect(result).toEqual({
      initialPair: {
        tokenIn: '.' as Portfolio.Token.Id,
        tokenOut:
          'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441' as Portfolio.Token.Id,
      },
    })
  })

  it('should throw an error when the response is invalid', async () => {
    const invalidFetchData: FetchData = async () =>
      ({
        tag: 'right',
        value: {
          status: 200,
          data: {
            initialPair: {
              tokenIn: 123, // Invalid type
              tokenOut: 'tokenOutId',
            },
          },
        },
      } as any)

    await expect(
      getSwapConfigApiMaker({request: invalidFetchData})(),
    ).rejects.toThrow(
      'Invalid swap config response: {"initialPair":{"tokenIn":123,"tokenOut":"tokenOutId"}}',
    )
  })

  it('should throw an error when there is a network error', async () => {
    const networkErrorFetchData: FetchData = async () =>
      ({
        tag: 'left',
        error: new Error('Network error'),
      } as any)

    await expect(
      getSwapConfigApiMaker({request: networkErrorFetchData})(),
    ).rejects.toThrow('Network error')
  })

  it('should not require passing a param', async () => {
    expect(getSwapConfigApiMaker()).toBeDefined()
  })
})
