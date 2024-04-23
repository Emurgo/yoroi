import {dappConnectorApiGetDappList} from './api'

describe('dappConnectorApiGetDappList', () => {
  it('should throw error if fetching fails', async () => {
    const fakeFetchData = () => Promise.reject(new Error('fake error'))
    await expect(() => dappConnectorApiGetDappList({request: fakeFetchData})()).rejects.toThrow()
  })

  it('should throw error if response is invalid', async () => {
    const fakeResult = {tag: 'right' as const, value: {data: {dapps: 1}}} as const
    const fakeFetchData = () => Promise.resolve(fakeResult)
    await expect(() => dappConnectorApiGetDappList({request: fakeFetchData as any})()).rejects.toThrow()
  })

  it('should throw error if response is left', async () => {
    const fakeResult = {tag: 'left' as const, error: {status: 404, message: 'Not found', responseData: null}} as const
    const fakeFetchData = () => Promise.resolve(fakeResult)
    await expect(() => dappConnectorApiGetDappList({request: fakeFetchData as any})()).rejects.toThrow()
  })

  it('should return data if response is valid', async () => {
    const fakeResult = {tag: 'right' as const, value: {data: {dapps: [], filters: {}}}} as const
    const fakeFetchData = () => Promise.resolve(fakeResult)
    const result = await dappConnectorApiGetDappList({request: fakeFetchData as any})()
    expect(result).toEqual(fakeResult.value.data)
  })
})
