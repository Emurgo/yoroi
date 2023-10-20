import {appApiMaker} from './app-api-maker'
import {fetcher} from '@yoroi/common'

describe('appApiMaker', () => {
  it('success', async () => {
    const appApi = appApiMaker({baseUrl: 'https://localhost'})
    expect(appApi).toBeDefined()

    const appApiWithFetcher = appApiMaker({
      baseUrl: 'https://localhost',
      request: fetcher,
    })
    expect(appApiWithFetcher).toBeDefined()
  })
})
