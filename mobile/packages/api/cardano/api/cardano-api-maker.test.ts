import {fetcher} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {cardanoApiMaker} from './cardano-api-maker'

describe('cardanoApiMaker', () => {
  it('should create API with default fetcher for Mainnet', () => {
    const cardanoApi = cardanoApiMaker({network: Chain.Network.Mainnet})
    expect(cardanoApi).toBeDefined()
    expect(cardanoApi.getProtocolParams).toBeDefined()
    expect(cardanoApi.getBestBlock).toBeDefined()
    expect(cardanoApi.getUtxoData).toBeDefined()
  })

  it('should create API with custom fetcher', () => {
    const cardanoApiWithFetcher = cardanoApiMaker({
      network: Chain.Network.Mainnet,
      request: fetcher,
    })
    expect(cardanoApiWithFetcher).toBeDefined()
  })

  it('should create API for Preprod network', () => {
    const cardanoApi = cardanoApiMaker({network: Chain.Network.Preprod})
    expect(cardanoApi).toBeDefined()
  })

  it('should create API for Preview network', () => {
    const cardanoApi = cardanoApiMaker({network: Chain.Network.Preview})
    expect(cardanoApi).toBeDefined()
  })

  it('should be frozen', () => {
    const cardanoApi = cardanoApiMaker({network: Chain.Network.Mainnet})
    expect(Object.isFrozen(cardanoApi)).toBe(true)
  })
})
