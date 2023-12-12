import {cardanoApiMaker} from './cardano-api-maker'
import {fetcher} from '@yoroi/common'

describe('cardanoApiMaker', () => {
  it('success', async () => {
    const cardanoApi = cardanoApiMaker({baseUrl: 'https://localhost'})
    expect(cardanoApi).toBeDefined()

    const cardanoApiWithFetcher = cardanoApiMaker({
      baseUrl: 'https://localhost',
      request: fetcher,
    })
    expect(cardanoApiWithFetcher).toBeDefined()
  })
})
