import {Portfolio} from '@yoroi/types'

const primaryETH: Portfolio.Token.Info = {
  decimals: 18,
  ticker: 'ETH',
  name: 'Ethereum',
  symbol: 'Ξ',
  image: 'https://cdn.example.com/eth.png',
  status: Portfolio.Token.Status.Normal,
  application: Portfolio.Token.Application.Token,
  tag: '',
  reference: '0x1234567890abcdef.eth',
  fingerprint: '0x1234567890abcdef',
  website: 'https://ethereum.org',
  coverBanner: 'https://cdn.example.com/eth-banner.png',
  originalImage: 'https://cdn.example.com/eth-original.png',
  id: '.',
  nature: Portfolio.Token.Nature.Primary,
  type: Portfolio.Token.Type.FT,
} as const

const nftCryptoKitty: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'CryptoKitty',
  name: 'CryptoKitty #1234',
  symbol: 'CK',
  image:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE4MSIgaGVpZ2h0PSIxMzgyIiB2aWV3Qm94PSIwIDAgMTE4MSAxMzgyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zOC44MDAxIDMxOS41NDZMNTUyLjYzNiAyMy4wMzc3QzU3Ni42NjMgOS4xNzMxOCA2MDYuMjY0IDkuMTk0MiA2MzAuMjcxIDIzLjA5MjlMMTE0Mi4zIDMxOS41MjhDMTE2Ni4yNSAzMzMuMzk3IDExODEgMzU4Ljk3OSAxMTgxIDM4Ni42NTlWOTk1LjM0MUMxMTgxIDEwMjMuMDIgMTE2Ni4yNSAxMDQ4LjYgMTE0Mi4zIDEwNjIuNDdMNjMwLjI3MSAxMzU4LjkxQzYwNi4yNjQgMTM3Mi44MSA1NzYuNjYzIDEzNzIuODMgNTUyLjYzNiAxMzU4Ljk2TDM4LjgwMDEgMTA2Mi40NUMxNC43OTEzIDEwNDguNiAwIDEwMjIuOTkgMCA5OTUuMjY3VjM4Ni43MzNDMCAzNTkuMDEzIDE0Ljc5MTQgMzMzLjQwMSAzOC44MDAxIDMxOS41NDZaIiBmaWxsPSIjMTAxMDEwIi8+PHBhdGggZD0iTTU4OS4yMDUgNjMxLjA3OEw5Ni45NjI0IDM0Ni44ODNMNTg5LjIwNSA2Mi42ODQ3TDEwODEuNDUgMzQ2Ljg4M0w1ODkuMjA1IDYzMS4wNzhaIiBmaWxsPSIjRTMwMDFDIi8+PHBhdGggZD0iTTUyLjM1OTkgMTAwMi40M0w1Mi4zNTk5IDQzNC4wMzZMNTQ0LjYwMiA3MTguMjMxVjEyODYuNjJMNTIuMzU5OSAxMDAyLjQzWiIgZmlsbD0iIzQ0RkYwMiIvPjxwYXRoIGQ9Ik02MzIuMjcxIDcyMS43OThWMTI5MC4xOUwxMTI0LjUxIDEwMDZWNDM3LjYwM0w2MzIuMjcxIDcyMS43OThaIiBmaWxsPSIjRkZGNTAyIi8+PC9zdmc+Cg==',
  status: Portfolio.Token.Status.Normal,
  application: Portfolio.Token.Application.Token,
  tag: '',
  reference: '0xabcdef1234567890.cryptokitty1234',
  website: 'https://www.cryptokitties.co',
  coverBanner: 'https://cdn.example.com/ck-banner.png',
  originalImage: 'https://cdn.example.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.NFT,
} as const

export const tokenInfoMocks = {
  primaryETH,
  nftCryptoKitty,
}
