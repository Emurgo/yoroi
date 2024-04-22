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
})
