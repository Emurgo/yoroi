import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {infoFilterByName} from './info-filter-by-name'

describe('infoFilterByName', () => {
  it('should return a function that filters token info by name or ticker', () => {
    const filter = infoFilterByName('cRyP')

    expect(filter(tokenInfoMocks.nftCryptoKitty)).toBe(true)
  })

  it('should return false if the token info does not match the search', () => {
    const filter = infoFilterByName('ADA')

    expect(filter(tokenInfoMocks.primaryETH)).toBe(false)
  })

  it('should return true if the search is empty', () => {
    const filter = infoFilterByName('')

    expect(filter(tokenInfoMocks.primaryETH)).toBe(true)
  })
})
