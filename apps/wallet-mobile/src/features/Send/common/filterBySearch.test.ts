import {TokenInfo} from '../../../yoroi-wallets/types'
import {filterBySearch} from './filterBySearch'

describe('filterBySearch', () => {
  const fakeToken1: TokenInfo<'ft'> = {
    id: '',
    kind: 'ft',
    name: 'TADANAME',
    description: 'Cardano',
    fingerprint: '',
    metadata: {
      decimals: 6,
      ticker: undefined,
      symbol: '₳',
      logo: '',
      url: '',
      group: '',
    },
  } as const

  const fakeToken2: TokenInfo<'ft'> = {
    kind: 'ft',
    id: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    fingerprint: 'asset1nvcwnq60jnm27efjm87xnhqt6alsv024tdyxjm',
    name: '',
    description: '',
    metadata: {
      decimals: 0,
      group: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
      logo: undefined,
      symbol: undefined,
      ticker: 'TADATICKER',
      url: undefined,
    },
  }

  const tokenInfos: TokenInfo<'ft'>[] = [fakeToken1, fakeToken2]

  it('should return all tokenInfos if searchTerm is empty', () => {
    const searchTerm = ''
    const filteredTokenInfos = tokenInfos.filter(filterBySearch(searchTerm))
    expect(filteredTokenInfos).toEqual(tokenInfos)
  })

  it('should return filtered tokenInfos if searchTerm is not empty and it is a ticker', () => {
    const searchTerm = 'TADANAME'
    const filteredTokenInfos = tokenInfos.filter(filterBySearch(searchTerm))
    expect(filteredTokenInfos).toEqual([fakeToken1])
  })

  it('should return filtered tokenInfos if searchTerm is not empty and it is a name', () => {
    const searchTerm = 'TADATICKER'
    const filteredTokenInfos = tokenInfos.filter(filterBySearch(searchTerm))
    expect(filteredTokenInfos).toEqual([fakeToken2])
  })

  it('should not return any tokenInfos if searchTerm does not match any ticker or name', () => {
    const searchTerm = 'RANDOM'
    const filteredTokenInfos = tokenInfos.filter(filterBySearch(searchTerm))
    expect(filteredTokenInfos).toEqual([])
  })
})
