import {getNftFilenameMediaType} from './nfts'

describe('getNftFilenameMediaType', () => {
  it('resolves mediaType from original metadata when src is a string', () => {
    const files = [
      {mediaType: 'image/svg+xml', src: 'image2.svg'},
      {mediaType: 'image/jpeg', src: 'image.jpg'},
    ]

    const mediaType = getNftFilenameMediaType('image.jpg', files)

    expect(mediaType).toEqual('image/jpeg')
  })

  it('resolves mediaType from original metadata when src is an array of strings', () => {
    const files =[
        {mediaType: 'image/svg+xml', src: 'image2.svg'},
        {mediaType: 'image/jpeg', src: ['https://example.com/', 'image.jpg']},
      ]

    const mediaType = getNftFilenameMediaType('https://example.com/image.jpg', files)
    expect(mediaType).toEqual('image/jpeg')
  })

  it('resolves to undefined when src is not found in original metadata', () => {
    const files = [
        {mediaType: 'image/svg+xml', src: 'image2.svg'},
        {mediaType: 'image/jpeg', src: 'image.jpg'},
      ]

    const mediaType = getNftFilenameMediaType( 'unknown.jpg', files)
    expect(mediaType).toEqual(undefined)
  })

  it('resolves to undefined when original metadata is not present', () => {
    const mediaType = getNftFilenameMediaType('unknown.jpg')
    expect(mediaType).toEqual(undefined)
  })
})
