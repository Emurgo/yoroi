import {Balance} from '@yoroi/types'

import {nft} from '../mocks'
import {convertNft, getNftFilenameMediaType} from './nfts'

describe('convertNft', () => {
  describe('id', () => {
    it('converts id from policyId and shortName', () => {
      const nft = convertNft({
        metadata: undefined,
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '2',
      })

      expect(nft.id).toEqual('8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.32')
    })
  })

  describe('fingerprint', () => {
    it('converts fingerprint from policyId and shortName', () => {
      const nft = convertNft({
        metadata: undefined,
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: 'Image1',
      })

      expect(nft.fingerprint).toEqual('asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3')
    })
  })

  describe('name', () => {
    it('converts name from metadata', () => {
      const nft = convertNft({
        metadata: {
          name: 'Name',
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '',
      })

      expect(nft.name).toEqual('Name')
    })

    it('converts name from shortName when medata is missing', () => {
      const nft = convertNft({
        metadata: {},
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '2',
      })

      expect(nft.name).toEqual('2')
    })
  })

  describe('description', () => {
    it('converts description from metadata description of type string', () => {
      const nft = convertNft({
        metadata: {
          description: 'Description',
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '2',
      })

      expect(nft.description).toEqual('Description')
    })

    it('converts description from metadata description of type string[]', () => {
      const nft = convertNft({
        metadata: {
          description: ['Description1', 'Description2'],
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '2',
      })

      expect(nft.description).toEqual('Description1Description2')
    })
  })

  describe('thumbnail and image', () => {
    it('supports ipfs images', () => {
      const nft = convertNft({
        metadata: {
          image: 'ipfs://QmZ89agib39odneyezeyxp2ekXPLqm86NHCgEXZy9PJ1Gs',
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '1',
      })

      expect(nft.icon).toEqual('https://ipfs.io/ipfs/QmZ89agib39odneyezeyxp2ekXPLqm86NHCgEXZy9PJ1Gs')
      expect(nft.image).toEqual('https://ipfs.io/ipfs/QmZ89agib39odneyezeyxp2ekXPLqm86NHCgEXZy9PJ1Gs')
    })

    it('supports non-ipfs images', () => {
      const nft = convertNft({
        metadata: {
          image: 'https://example.com/image.jpeg',
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '1',
      })

      expect(nft.icon).toEqual('https://example.com/image.jpeg')
      expect(nft.image).toEqual('https://example.com/image.jpeg')
    })

    it('supports images as an array of strings', () => {
      const nft = convertNft({
        metadata: {
          image: ['https://example.com/', 'image.jpeg'],
        },
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '1',
      })

      expect(nft.icon).toEqual('https://example.com/image.jpeg')
      expect(nft.image).toEqual('https://example.com/image.jpeg')
    })
  })

  describe('metadata.policyId', () => {
    it('puts policyId into metadata', () => {
      const nft = convertNft({
        metadata: {},
        storageUrl: '',
        policyId: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4',
        shortName: '1',
      })

      expect(nft.group).toEqual('8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4')
    })
  })

  describe('metadata.originalMetadata', () => {
    it('puts everything from metadata into originalMetadata', () => {
      const nft = convertNft({
        metadata: {
          name: 'Name',
          description: 'Description',
          image: 'https://example.com/image.jpeg',
        },
        storageUrl: '',
        policyId: '',
        shortName: '1',
      })

      expect(nft.metadatas.mintNft).toEqual({
        name: 'Name',
        description: 'Description',
        image: 'https://example.com/image.jpeg',
      })
    })
  })
})

describe('getNftFilenameMediaType', () => {
  it('resolves mediaType from original metadata when src is a string', () => {
    const customMediaTypeNft = getNftWithCustomOriginalMetadata({
      files: [
        {mediaType: 'image/svg+xml', src: 'image2.svg'},
        {mediaType: 'image/jpeg', src: 'image.jpg'},
      ],
    })
    const mediaType = getNftFilenameMediaType(customMediaTypeNft, 'image.jpg')

    expect(mediaType).toEqual('image/jpeg')
  })

  it('resolves mediaType from original metadata when src is an array of strings', () => {
    const customMediaTypeNft = getNftWithCustomOriginalMetadata({
      files: [
        {mediaType: 'image/svg+xml', src: 'image2.svg'},
        {mediaType: 'image/jpeg', src: ['https://example.com/', 'image.jpg']},
      ],
    })

    const mediaType = getNftFilenameMediaType(customMediaTypeNft, 'https://example.com/image.jpg')
    expect(mediaType).toEqual('image/jpeg')
  })

  it('resolves to undefined when src is not found in original metadata', () => {
    const customMediaTypeNft = getNftWithCustomOriginalMetadata({
      files: [
        {mediaType: 'image/svg+xml', src: 'image2.svg'},
        {mediaType: 'image/jpeg', src: 'image.jpg'},
      ],
    })

    const mediaType = getNftFilenameMediaType(customMediaTypeNft, 'unknown.jpg')
    expect(mediaType).toEqual(undefined)
  })

  it('resolves to undefined when mediaType is not a string', () => {
    const customMediaTypeNft = getNftWithCustomOriginalMetadata({
      files: [{mediaType: 1, src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft, 'image.jpg')).toEqual(undefined)

    const customMediaTypeNft2 = getNftWithCustomOriginalMetadata({
      files: [{mediaType: null, src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft2, 'image.jpg')).toEqual(undefined)

    const customMediaTypeNft3 = getNftWithCustomOriginalMetadata({
      files: [{mediaType: undefined, src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft3, 'image.jpg')).toEqual(undefined)

    const customMediaTypeNft4 = getNftWithCustomOriginalMetadata({
      files: [{mediaType: {}, src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft4, 'image.jpg')).toEqual(undefined)

    const customMediaTypeNft5 = getNftWithCustomOriginalMetadata({
      files: [{mediaType: [], src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft5, 'image.jpg')).toEqual(undefined)

    const customMediaTypeNft6 = getNftWithCustomOriginalMetadata({
      files: [{mediaType: true, src: 'image.jpg'}],
    })
    expect(getNftFilenameMediaType(customMediaTypeNft6, 'image.jpg')).toEqual(undefined)
  })

  it('resolves to undefined when original metadata is not present', () => {
    const mediaType = getNftFilenameMediaType(getNftWithCustomOriginalMetadata(undefined), 'unknown.jpg')
    expect(mediaType).toEqual(undefined)
  })

  it('resolves to undefined when files is wrongly typed', () => {
    const nftWithFilesUndefined = getNftWithCustomOriginalMetadata({files: undefined})
    expect(getNftFilenameMediaType(nftWithFilesUndefined, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesNull = getNftWithCustomOriginalMetadata({files: null})
    expect(getNftFilenameMediaType(nftWithFilesNull, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesObject = getNftWithCustomOriginalMetadata({files: {}})
    expect(getNftFilenameMediaType(nftWithFilesObject, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesNumber = getNftWithCustomOriginalMetadata({files: 1})
    expect(getNftFilenameMediaType(nftWithFilesNumber, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesString = getNftWithCustomOriginalMetadata({files: 'string'})
    expect(getNftFilenameMediaType(nftWithFilesString, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesBoolean = getNftWithCustomOriginalMetadata({files: true})
    expect(getNftFilenameMediaType(nftWithFilesBoolean, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesEmptyArray = getNftWithCustomOriginalMetadata({files: []})
    expect(getNftFilenameMediaType(nftWithFilesEmptyArray, 'unknown.jpg')).toEqual(undefined)

    const nftWithFilesArrayWithWrongType = getNftWithCustomOriginalMetadata({
      files: [1, null, undefined, 'string', {}, [], true, false],
    })
    expect(getNftFilenameMediaType(nftWithFilesArrayWithWrongType, 'unknown.jpg')).toEqual(undefined)
  })
})

const getNftWithCustomOriginalMetadata = (metadata: unknown): Balance.TokenInfo => ({
  ...nft,
  metadatas: {mintNft: metadata},
})
