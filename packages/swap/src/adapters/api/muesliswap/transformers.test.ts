import {Chain} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {transformersMaker} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'

const address = 'addr1q9g8vz5'
const addressHex = 'DEADBEEF'
const network = Chain.Network.Mainnet
const stakingKey = 'stake1u8'
const transformers = transformersMaker({
  primaryTokenInfo,
  address,
  addressHex,
  network,
  stakingKey,
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
})
