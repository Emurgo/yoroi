import {Chain} from '@yoroi/types'
import {fetcher} from '@yoroi/common'

import {cardanoApiMaker} from './cardano-api-maker'

describe('cardanoApiMaker', () => {
  it('success', async () => {
    const cardanoApi = cardanoApiMaker({network: Chain.Network.Mainnet})
    expect(cardanoApi).toBeDefined()

    const cardanoApiWithFetcher = cardanoApiMaker({
      network: Chain.Network.Mainnet,
      request: fetcher,
    })
    expect(cardanoApiWithFetcher).toBeDefined()
  })
})
