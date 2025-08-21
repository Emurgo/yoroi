import {Portfolio} from '@yoroi/types'

import {primaryTokenId} from '../constants'
import {createPrimaryTokenInfo} from './create-primary-token-info'

describe('createPrimaryTokenInfo', () => {
  it('should create primary token info with additional properties', () => {
    const cardanoPtMainnet: Omit<
      Portfolio.Token.Info,
      'id' | 'nature' | 'type' | 'application' | 'fingerprint' | 'status'
    > = {
      name: 'Cardano',
      symbol: '₳',
      decimals: 6,
      originalImage: '',
      reference: '',
      tag: '',
      ticker: 'ADA',
      website: 'https://cardano.org/',
      description: '',
    }

    const expectedTokenInfo: Readonly<Portfolio.Token.Info> = {
      id: primaryTokenId,
      nature: Portfolio.Token.Nature.Primary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.Coin,
      fingerprint: '',
      status: Portfolio.Token.Status.Valid,
      ...cardanoPtMainnet,
    }

    const result = createPrimaryTokenInfo(cardanoPtMainnet)

    expect(result).toEqual(expectedTokenInfo)
    expect(Object.isFrozen(result)).toBe(true)
  })
})
