import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets'
import {nft} from '../../../../../yoroi-wallets/mocks'
import {filterTokenInfosByTab} from './filterTokenInfosByTab'
import {Tabs} from './SelectTokenFromListScreen'

describe('filterTokenInfosByTab', () => {
  const fakeTokenInfo1: TokenInfo = {
    id: '',
    name: 'TADANAME',
    decimals: 6,
    description: 'Cardano',
    ticker: undefined,
    symbol: '₳',
    logo: '',
    url: '',
    fingerprint: 'fake-fingerprint1',
    group: '',
  } as const

  const fakeTokenInfo2: TokenInfo = {
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

  const nft1: YoroiNft = {
    ...nft,
    fingerprint: 'fake-fingerprinnt3',
  }

  const fakeTokenInfo3: TokenInfo = {
    id: nft1.id,
    name: nft1.name,
    decimals: 6,
    description: nft1.description,
    ticker: undefined,
    symbol: undefined,
    logo: nft1.logo,
    url: undefined,
    fingerprint: nft1.fingerprint,
    group: '',
  }

  const nft2: YoroiNft = {
    ...nft,
    fingerprint: 'fake-fingerprinnt4',
  }

  const fakeTokenInfo4: TokenInfo = {
    id: nft2.id,
    name: nft2.name,
    decimals: 6,
    description: nft2.description,
    ticker: undefined,
    symbol: undefined,
    logo: nft2.logo,
    url: undefined,
    fingerprint: nft2.fingerprint,
    group: '',
  }

  const nfts = [nft1, nft2]
  const allTokenInfos = [fakeTokenInfo1, fakeTokenInfo2, fakeTokenInfo3, fakeTokenInfo4]

  it.each<{activeTab: Tabs; result: TokenInfo[]}>([
    {activeTab: 'all', result: allTokenInfos},
    {activeTab: 'nfts', result: [fakeTokenInfo3, fakeTokenInfo4]},
    {activeTab: 'tokens', result: [fakeTokenInfo1, fakeTokenInfo2]},
  ])(
    'should filter tokenInfos by non-matching nfts fingerprint when activeTab is "$activeTab"',
    ({activeTab, result}) => {
      const filteredTokenInfos = filterTokenInfosByTab({nfts, activeTab, tokenInfos: allTokenInfos})
      expect(filteredTokenInfos).toEqual(result)
    },
  )
})
