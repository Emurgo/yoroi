import {Portfolio} from '@yoroi/types'
import {createPrimaryTokenInfo} from './create-primary-token-info'

describe('createPrimaryTokenInfo', () => {
  it('should create primary token info with additional properties', () => {
    const cardanoPtMainnet: Omit<
      Portfolio.Token.Info,
      'id' | 'nature' | 'type'
    > = {
      name: 'Cardano',
      symbol: '₳',
      decimals: 6,
      application: Portfolio.Token.Application.Token,
      coverBanner: '',
      image: '',
      originalImage: '',
      reference: '',
      status: Portfolio.Token.Status.Normal,
      tag: '',
      ticker: 'ADA',
      website: 'https://cardano.org/',
    }

    const expectedTokenInfo: Readonly<Portfolio.Token.Info> = {
      id: '.',
      nature: Portfolio.Token.Nature.Primary,
      type: Portfolio.Token.Type.FT,
      ...cardanoPtMainnet,
    }

    const result = createPrimaryTokenInfo(cardanoPtMainnet)

    expect(result).toEqual(expectedTokenInfo)
    expect(Object.isFrozen(result)).toBe(true)
  })
})
