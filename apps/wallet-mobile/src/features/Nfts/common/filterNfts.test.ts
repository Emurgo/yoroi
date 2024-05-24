import {Balance} from '@yoroi/types'

import {nft} from '../../../yoroi-wallets/mocks'
import {filterNfts} from './filterNfts'

describe('filterNfts', () => {
  const cryptoWolf = {...nft, id: '0', fingerprint: 'fakefingerprint1', name: 'CryptoWolf #1234'}
  const boredMonkey = {...nft, id: '1', fingerprint: 'fakefingerprint2', name: 'Bored Monkey #4567'}
  const appleBlocks = {...nft, id: '2', fingerprint: 'fakefingerprint3', name: 'Apple Blocks #7890'}

  const nfts: Balance.TokenInfo[] = [cryptoWolf, boredMonkey, appleBlocks]

  it('filters NFTs correctly with case-insensitive search term', () => {
    const filteredNfts = filterNfts('APple bLOcks', nfts)
    expect(filteredNfts).toEqual([appleBlocks])
  })

  it('returns empty array when nft array is empty', () => {
    const filteredNfts = filterNfts('Bored Monkey #4567', [])
    expect(filteredNfts).toEqual([])
  })

  it('returns all NFTs when search term is empty', () => {
    const filteredNfts = filterNfts('', nfts)
    expect(filteredNfts).toEqual(nfts)
  })
})
