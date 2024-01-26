import {mockedBackendConfig} from '../mocks'

import {NFT_METADATA_KEY} from './metadata'
import {parseNFT} from './metadata'

const storageUrl = 'https://example.com'

const policyId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f'
const nameHex = '3030'
const tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.3030'
const nftId = tokenId

describe('parseNFT', () => {
  it('successfully parses', () => {
    const nft = {
      key: NFT_METADATA_KEY,
      metadata: {
        [policyId]: {[nameHex]: 'foo'},
      },
    }
    const parsedNft = {
      id: nftId,
    }
    const assetMetadatas = [nft]
    const assetSupplies = {[nftId]: '1'}

    expect(parseNFT(assetMetadatas, assetSupplies, tokenId, mockedBackendConfig)).toMatchObject(parsedNft)
  })

  it('returns null: assetMetadatas is not an array', () => {
    const {parseNFT} = jest.requireActual('./metadata')

    const nft = {
      key: NFT_METADATA_KEY,
      metadata: {
        [policyId]: {[nameHex]: 'foo'},
      },
    }

    const assetMetadatas = nft
    const assetSupplies = {[nftId]: '1'}

    expect(parseNFT(assetMetadatas, assetSupplies, tokenId, mockedBackendConfig)).toBe(null)
  })

  it('returns null: assetMetadatas doesnt contain any NFT', () => {
    const config = {NFT_STORAGE_URL: storageUrl}
    const assetMetadatas = ['dlddkldkdkkd']
    const assetSupplies = {[nftId]: '1'}

    expect(parseNFT(assetMetadatas, assetSupplies, tokenId, mockedBackendConfig)).toBe(null)
  })

  it('returns null: asset supply is different that 0 or 1', () => {
    const nft = {
      key: NFT_METADATA_KEY,
      metadata: {
        [policyId]: {[nameHex]: 'foo'},
      },
    }
    const assetMetadatas = [nft]
    const assetSupplies = {[nftId]: '1123455'}

    expect(parseNFT(assetMetadatas, assetSupplies, tokenId, mockedBackendConfig)).toBe(null)
  })
})
