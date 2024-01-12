/* import {Balance} from '@yoroi/types' */

jest.mock('./metadata')
jest.mock('../nfts')
jest.mock('./fetch')
jest.mock('./utils')
jest.mock('./assetSuply')
import {convertNft} from '../nfts'
import {NFT_METADATA_KEY} from './metadata'

const storageUrl = 'https://example.com'

describe('parseNFT', () => {
  it('successfully parses', () => {
    const {parseNFT} = jest.requireActual('./metadata')

    const config = {NFT_STORAGE_URL: storageUrl}
    const policyId = 'policy-id'
    const nameHex = 'name-hex'
    const nftId = 'nft-id'
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    convertNft.mockImplementation(() => parsedNft)

    expect(parseNFT(assetMetadatas, assetSupplies, policyId, nameHex, config)).toEqual(parsedNft)
  })

  it('returns null: assetMetadatas is not an array', () => {
    const {parseNFT} = jest.requireActual('./metadata')

    const config = {NFT_STORAGE_URL: storageUrl}
    const policyId = 'policy-id'
    const nameHex = 'name-hex'
    const nftId = 'nft-id'
    const nft = {
      key: NFT_METADATA_KEY,
      metadata: {
        [policyId]: {[nameHex]: 'foo'},
      },
    }
    const parsedNft = {
      id: nftId,
    }
    const assetMetadatas = nft
    const assetSupplies = {[nftId]: '1'}

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    convertNft.mockImplementation(() => parsedNft)

    expect(parseNFT(assetMetadatas, assetSupplies, policyId, nameHex, config)).toBe(null)
  })

  it('returns null: assetMetadatas doesnt contain any NFT', () => {
    const {parseNFT} = jest.requireActual('./metadata')

    const config = {NFT_STORAGE_URL: storageUrl}
    const policyId = 'policy-id'
    const nameHex = 'name-hex'
    const nftId = 'nft-id'
    const parsedNft = {
      id: nftId,
    }
    const assetMetadatas = ['dlddkldkdkkd']
    const assetSupplies = {[nftId]: '1'}

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    convertNft.mockImplementation(() => parsedNft)

    expect(parseNFT(assetMetadatas, assetSupplies, policyId, nameHex, config)).toBe(null)
  })

  it('returns null: asset supply is different that 0 or 1', () => {
    const {parseNFT} = jest.requireActual('./metadata')

    const config = {NFT_STORAGE_URL: storageUrl}
    const policyId = 'policy-id'
    const nameHex = 'name-hex'
    const nftId = 'nft-id'
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
    const assetSupplies = {[nftId]: '1123455'}

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    convertNft.mockImplementation(() => parsedNft)

    expect(parseNFT(assetMetadatas, assetSupplies, policyId, nameHex, config)).toBe(null)
  })
})
