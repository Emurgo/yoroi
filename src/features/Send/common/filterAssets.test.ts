import {TokenInfo} from '../../../yoroi-wallets'
import {filterAssets} from './filterAssets'

describe('filterAssets', () => {
  const fakeToken1: TokenInfo = {
    id: '',
    name: 'TADANAME',
    decimals: 6,
    description: 'Cardano',
    ticker: undefined,
    symbol: '₳',
    logo: '',
    url: '',
    fingerprint: '',
    group: '',
  } as const

  const fakeToken2: TokenInfo = {
    decimals: 0,
    description: '',
    fingerprint: 'asset1nvcwnq60jnm27efjm87xnhqt6alsv024tdyxjm',
    group: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
    id: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
    logo: undefined,
    name: undefined,
    symbol: undefined,
    ticker: 'TADATICKER',
    url: undefined,
  }

  const tokenInfos: TokenInfo[] = [fakeToken1, fakeToken2]

  it('should return all tokenInfos if searchTerm is empty', () => {
    const searchTerm = ''
    const filteredTokenInfos = filterAssets(searchTerm, tokenInfos)
    expect(filteredTokenInfos).toEqual(tokenInfos)
  })

  it('should return filtered tokenInfos if searchTerm is not empty and it is a ticker', () => {
    const searchTerm = 'TADANAME'
    const filteredTokenInfos = filterAssets(searchTerm, tokenInfos)
    expect(filteredTokenInfos).toEqual([fakeToken1])
  })

  it('should return filtered tokenInfos if searchTerm is not empty and it is a name', () => {
    const searchTerm = 'TADATICKER'
    const filteredTokenInfos = filterAssets(searchTerm, tokenInfos)
    expect(filteredTokenInfos).toEqual([fakeToken2])
  })

  it('should not return any tokenInfos if searchTerm does not match any ticker or name', () => {
    const searchTerm = 'RANDOM'
    const filteredTokenInfos = filterAssets(searchTerm, tokenInfos)
    expect(filteredTokenInfos).toEqual([])
  })
})
