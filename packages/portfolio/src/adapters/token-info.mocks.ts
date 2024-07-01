import {Api, App, Portfolio} from '@yoroi/types'
import {cacheRecordMaker} from '@yoroi/common'
import {freeze} from 'immer'

const primaryETH: Portfolio.Token.Info = {
  decimals: 18,
  ticker: 'ETH',
  name: 'Ethereum',
  symbol: 'Ξ',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.General,
  tag: '',
  reference: '0x1234567890abcdef.eth',
  fingerprint: '0x1234567890abcdef',
  website: 'https://ethereum.org',
  originalImage: 'https://cdn.example.com/eth-original.png',
  id: '.',
  nature: Portfolio.Token.Nature.Primary,
  type: Portfolio.Token.Type.FT,
  description: '',
}

const nftCryptoKitty: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'CryptoKitty',
  name: 'CryptoKitty #1234',
  symbol: 'CK',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.General,
  tag: '',
  reference: '0xabcdef1234567890.cryptokitty1234',
  website: 'https://www.cryptokitties.co',
  originalImage: 'https://cdn.example.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.NFT,
  description: '',
}

const rnftWhatever: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'Whatever',
  name: 'Whatever #42',
  symbol: 'WTH',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Music,
  tag: '222',
  reference: 'transactionId#1',
  website: 'https://www.whaha.co',
  originalImage: 'https://cdn.whatha.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3031',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.NFT,
  description: '',
}

const ftNoTicker: Portfolio.Token.Info = {
  decimals: 0,
  ticker: '',
  name: 'ZZZZZ',
  symbol: 'WTH',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Music,
  tag: '222',
  reference: 'transactionId#1',
  website: 'https://www.whaha.co',
  originalImage: 'https://cdn.whatha.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3032',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  description: '',
}

const ftNameless: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'zz',
  name: '',
  symbol: 'WTH',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Music,
  tag: '222',
  reference: 'transactionId#1',
  website: 'https://www.whaha.co',
  originalImage: 'https://cdn.whatha.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3033',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  description: '',
}

// NOTE: If you marked a record as not modified 304, remember to add to the intiial state
// otherwise the tests will throw cuz it will be expected the record to exist in the cache
const apiResponseTokenInfos: Portfolio.Api.TokenInfosResponse = {
  [nftCryptoKitty.id]: [Api.HttpStatusCode.Ok, nftCryptoKitty, 'hash2-1', 3600],
  [rnftWhatever.id]: [Api.HttpStatusCode.NotModified, 3600],
  [ftNoTicker.id]: [Api.HttpStatusCode.Ok, ftNoTicker, 'hash4-1', 3600],
  [ftNameless.id]: [Api.HttpStatusCode.Ok, ftNameless, 'hash5', 3600],
}

const apiRequestTokenInfos: ReadonlyArray<
  Api.RequestWithCache<Portfolio.Token.Id>
> = [
  [nftCryptoKitty.id, 'hash2'],
  [rnftWhatever.id, 'hash3'],
  [ftNoTicker.id, 'hash4'],
  [ftNameless.id, 'hash5'],
]

const storage: {
  entries1: ReadonlyArray<
    [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
  >
  notModified: ReadonlyArray<
    [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
  >
  cached: ReadonlyArray<
    [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
  >
} = {
  notModified: [
    [
      rnftWhatever.id,
      cacheRecordMaker(
        {expires: Date.now() - 3_600_000, hash: 'hash3'},
        rnftWhatever,
      ),
    ],
  ],
  cached: [
    [
      rnftWhatever.id,
      cacheRecordMaker(
        {expires: Date.now() + 3_600_000, hash: 'hash3'},
        rnftWhatever,
      ),
    ],
  ],
  entries1: [
    [
      nftCryptoKitty.id,
      cacheRecordMaker(
        {expires: Date.now() - 3_600_000, hash: 'hash2'},
        nftCryptoKitty,
      ),
    ],
    [
      rnftWhatever.id,
      cacheRecordMaker(
        {expires: Date.now() + 3_600_000, hash: 'hash3'},
        rnftWhatever,
      ),
    ],
    [
      ftNoTicker.id,
      cacheRecordMaker(
        {expires: Date.now() - 3_600_000, hash: 'hash4'},
        ftNoTicker,
      ),
    ],
    [
      ftNameless.id,
      cacheRecordMaker(
        {expires: Date.now() + 3_600_000, hash: 'hash5'},
        ftNameless,
      ),
    ],
  ],
}

const apiResponseTokenInfo: Readonly<
  Record<'success' | 'error', Api.Response<Portfolio.Token.Info>>
> = freeze(
  {
    success: {
      tag: 'right',
      value: {
        status: 200,
        data: nftCryptoKitty,
      },
    },
    error: {
      tag: 'left',
      error: {
        status: 404,
        responseData: null,
        message: 'Not found',
      },
    },
  },
  true,
)

export const tokenInfoMocks = freeze({
  primaryETH,
  nftCryptoKitty,
  rnftWhatever,
  ftNoTicker,
  ftNameless,

  storage,

  apiResponseResult: apiResponseTokenInfos,
  apiRequestArgs: apiRequestTokenInfos,
  apiReponse: {
    nftCryptoKitty: apiResponseTokenInfo,
  },
})
