import {cardanoApiMaker} from './cardano-api-maker'
import {fetcher} from '@yoroi/common'

describe('cardanoApiMaker', () => {
  it('success', async () => {
    const cardanoApi = cardanoApiMaker({network: 'mainnet'})
    expect(cardanoApi).toBeDefined()

    const cardanoApiWithFetcher = cardanoApiMaker({
      network: 'mainnet',
      request: fetcher,
    })
    expect(cardanoApiWithFetcher).toBeDefined()
  })
})
