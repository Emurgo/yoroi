import {Balance} from '@yoroi/types'

import {tokenKeyExtractor} from './token'

describe('tokenKeyExtractor', () => {
  it('should return the token info id', () => {
    const token = {
      info: {
        id: 'token_id',
      },
    }

    const result = tokenKeyExtractor(token as Balance.Token)

    expect(result).toBe('token_id')
  })
})
