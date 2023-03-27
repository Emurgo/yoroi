import {YoroiNft} from '../yoroi-wallets'
import {filterNfts} from './filterNfts'

describe('filterNfts', () => {
  const nfts = [{name: 'CryptoWolf #1234'}, {name: 'Bored Monkey #4567'}, {name: 'Apple Blocks #7890'}] as YoroiNft[]

  it('filters NFTs correctly with capitalized search term', () => {
    const filteredNfts = filterNfts('APple bLOcks', nfts)
    expect(filteredNfts).toHaveLength(1)
    expect(filteredNfts[0].name).toEqual('Apple Blocks #7890')
  })

  it('returns empty array when nft array is empty', () => {
    const filteredNfts = filterNfts('Bored Monkey #4567', [])
    expect(filteredNfts).toHaveLength(0)
  })

  it('returns all NFTs when search term is empty', () => {
    const filteredNfts = filterNfts('', nfts)
    expect(filteredNfts).toHaveLength(3)
  })

  it('sorts NFTs by name', () => {
    const filteredNfts = filterNfts('o', nfts)

    expect(filteredNfts[0].name).toEqual('Apple Blocks #7890')
    expect(filteredNfts[1].name).toEqual('Bored Monkey #4567')
    expect(filteredNfts[2].name).toEqual('CryptoWolf #1234')
  })
})
