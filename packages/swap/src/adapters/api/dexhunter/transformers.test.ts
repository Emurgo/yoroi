import {Chain} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {ptIdDh, transformersMaker} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'

const address = 'addr1q9g8vz5'
const network = Chain.Network.Mainnet
const transformers = transformersMaker({
  primaryTokenInfo,
  address,
  network,
  isPrimaryToken,
})

describe('transformers', () => {
  describe('tokens', () => {
    test('should correctly transform the tokens response', () => {
      expect(transformers.tokens.response(api.responses.tokens)).toEqual(
        api.results.tokens,
      )
    })
  })

  test('should correctly transform the token id', () => {
    expect(transformers.tokens.fromId(ptIdDh)).toBe(primaryTokenInfo.id)
    expect(transformers.tokens.toId(primaryTokenInfo.id)).toBe('ADA')
  })
})
