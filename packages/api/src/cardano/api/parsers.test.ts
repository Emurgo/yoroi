import {
  isFtMetadata,
  isMetadataFile,
  isNftMetadata,
  parseFtMetadataRecord,
  parseNftMetadataRecord,
} from './parsers'

describe('isMetadataFile', () => {
  it('should return false if input is null', () => {
    expect(isMetadataFile(null)).toBe(false)
  })

  it('should return false if input is undefined', () => {
    expect(isMetadataFile(undefined)).toBe(false)
  })

  it('should return false if input is not an object', () => {
    expect(isMetadataFile(42)).toBe(false)
    expect(isMetadataFile('string')).toBe(false)
    expect(isMetadataFile([])).toBe(false)
    expect(isMetadataFile(true)).toBe(false)
  })

  it('should return false if name exists but is not a string', () => {
    expect(
      isMetadataFile({name: 123, mediaType: 'image/png', src: 'some-src'}),
    ).toBe(false)
  })

  it('should return false if mediaType is not a string', () => {
    expect(isMetadataFile({mediaType: 123, src: 'some-src'})).toBe(false)
  })

  it('should return false if src is not a string or array of strings', () => {
    expect(isMetadataFile({mediaType: 'image/png', src: 123})).toBe(false)
    expect(isMetadataFile({mediaType: 'image/png', src: [123]})).toBe(false)
    expect(isMetadataFile({mediaType: 'image/png', src: ['valid', 123]})).toBe(
      false,
    )
  })

  it('should return true if only required fields are valid and others are not present', () => {
    expect(isMetadataFile({mediaType: 'image/png', src: 'some-src'})).toBe(true)
    expect(isMetadataFile({mediaType: 'image/png', src: ['some-src']})).toBe(
      true,
    )
  })

  it('should return true if all fields are valid', () => {
    expect(
      isMetadataFile({
        name: 'some-name',
        mediaType: 'image/png',
        src: 'some-src',
      }),
    ).toBe(true)
    expect(
      isMetadataFile({
        name: 'some-name',
        mediaType: 'image/png',
        src: ['some-src'],
      }),
    ).toBe(true)
  })

  it('should return true if name is not present but other required fields are valid', () => {
    expect(isMetadataFile({mediaType: 'image/png', src: 'some-src'})).toBe(true)
  })
})

describe('isFtMetadata', () => {
  it('should return false if input is null', () => {
    expect(isFtMetadata(null)).toBe(false)
  })

  it('should return false if input is undefined', () => {
    expect(isFtMetadata(undefined)).toBe(false)
  })

  it('should return false if input is not an object', () => {
    expect(isFtMetadata(42)).toBe(false)
    expect(isFtMetadata('string')).toBe(false)
    expect(isFtMetadata([])).toBe(false)
    expect(isFtMetadata(true)).toBe(false)
  })

  it('should return false if name is not a string or is missing', () => {
    expect(isFtMetadata({name: 123})).toBe(false)
    expect(isFtMetadata({extra: 123})).toBe(false)
  })

  it('should return false if description exists but is not a string/array of strings', () => {
    expect(isFtMetadata({name: 'some-name', description: 123})).toBe(false)
  })

  it('should return false if policy exists but is not a string/array of strings', () => {
    expect(isFtMetadata({name: 'some-name', policy: 123})).toBe(false)
  })

  it('should return false if logo exists but is not a string/array of strings', () => {
    expect(isFtMetadata({name: 'some-name', logo: 123})).toBe(false)
  })

  it('should return false if ticker exists but is not a string', () => {
    expect(isFtMetadata({name: 'some-name', ticker: 123})).toBe(false)
  })

  it('should return false if url exists but is not a string/array of strings', () => {
    expect(isFtMetadata({name: 'some-name', url: 123})).toBe(false)
  })

  it('should return false if decimals exists but is not a positive number', () => {
    expect(isFtMetadata({name: 'some-name', decimals: -1})).toBe(false)
    expect(isFtMetadata({name: 'some-name', decimals: 'string'})).toBe(false)
  })

  it('should return true if only the name is valid and others are not present', () => {
    expect(isFtMetadata({name: 'some-name'})).toBe(true)
  })

  it('should return true if all fields are valid, including extras', () => {
    expect(
      isFtMetadata({
        name: 'some-name',
        description: 'some-description',
        policy: 'some-policy',
        logo: 'some-logo',
        ticker: 'some-ticker',
        url: 'some-url',
        decimals: 18,
        extra: 2,
      }),
    ).toBe(true)
  })
})

describe('isNftMetadata', () => {
  it('should return false if input is wrong', () => {
    expect(isNftMetadata(null)).toBe(false)
    expect(isNftMetadata(undefined)).toBe(false)
    expect(isNftMetadata(42)).toBe(false)
    expect(isNftMetadata('string')).toBe(false)
    expect(isNftMetadata([])).toBe(false)
    expect(isNftMetadata(true)).toBe(false)

    expect(isNftMetadata({})).toBe(false)
  })

  it('should return false if name/image is missing', () => {
    expect(isNftMetadata({image: 'data:image/png:some-image'})).toBe(false)
    expect(isNftMetadata({name: 'some-image'})).toBe(false)
  })

  it('should return false if name is not a string', () => {
    expect(isNftMetadata({name: 123})).toBe(false)
  })

  it('should return false if description exists but is not a string or array of strings', () => {
    expect(isNftMetadata({name: 'some-name', description: 123})).toBe(false)
    expect(isNftMetadata({name: 'some-name', description: [123]})).toBe(false)
  })

  it('should return false if mediaType exists but is not a string', () => {
    expect(isNftMetadata({name: 'some-name', mediaType: 123})).toBe(false)
  })

  it('should return false if image exists but is not a string or array of strings', () => {
    expect(isNftMetadata({name: 'some-name', image: 123})).toBe(false)
    expect(isNftMetadata({name: 'some-name', image: [123]})).toBe(false)
  })

  it('should return false if files exists but is not an array of valid MetadataFile', () => {
    expect(
      isNftMetadata({
        name: 'some-name',
        files: [{name: 123, mediaType: 'image/png', src: 'some-src'}],
      }),
    ).toBe(false)
    expect(
      isNftMetadata({
        name: 'some-name',
        files: [{name: 123, mediaType: 1, src: 'some-src'}],
      }),
    ).toBe(false)
    expect(isNftMetadata({name: 'some-name', mediaType: 1, image: ''})).toBe(
      false,
    )
  })

  it('should return true if only the required fields are valid and others are not present', () => {
    expect(
      isNftMetadata({name: 'some-name', image: 'data:image/png:some-image'}),
    ).toBe(true)
  })

  it('should return false if description type is invalid', () => {
    expect(
      isNftMetadata({
        name: 'some-name',
        image: 'data:image/png:some-image',
        description: 1,
      }),
    ).toBe(false)
  })

  it('should return true if all fields are valid and have or not extra fields', () => {
    expect(
      isNftMetadata({
        name: 'some-name',
        description: 'some-description',
        mediaType: 'some-mediaType',
        image: 'some-image',
        files: [
          {name: 'some-file-name', mediaType: 'image/png', src: 'some-src'},
        ],
        extra: 1,
      }),
    ).toBe(true)
    expect(
      isNftMetadata({
        name: 'files-as-object',
        description: 'files-as-object-some-description',
        mediaType: 'some-mediaType',
        image: 'some-image',
        files: {
          name: 'some-file-name',
          mediaType: 'image/png',
          src: 'some-src',
        },
      }),
    ).toBe(true)
  })

  it('should return true if description and image fields are arrays of strings and all fields are valid', () => {
    expect(
      isNftMetadata({
        name: 'some-name',
        description: ['some-description'],
        mediaType: 'some-mediaType',
        image: ['some-image'],
        files: [
          {name: 'some-file-name', mediaType: 'image/png', src: 'some-src'},
        ],
      }),
    ).toBe(true)
  })
})

describe('parseNftMetadataRecord', () => {
  it('should return the data', () => {
    expect(
      parseNftMetadataRecord({
        name: 'some-name',
        description: ['some-description'],
        mediaType: 'some-mediaType',
        image: ['some-image'],
        files: [
          {name: 'some-file-name', mediaType: 'image/png', src: 'some-src'},
        ],
      }),
    ).toBeDefined()
  })

  it('should return undefined if the data is not valid', () => {
    expect(
      parseNftMetadataRecord({
        image: ['some-image'],
        extra: 2,
      }),
    ).toBeUndefined()
  })
})

describe('parseFtMetadataRecord', () => {
  it('should return the data', () => {
    expect(
      parseFtMetadataRecord({
        name: 'some-name',
        description: 'some-description',
        policy: 'some-policy',
        logo: 'some-logo',
        ticker: 'some-ticker',
        url: 'some-url',
        decimals: 18,
        extra: 2,
      }),
    ).toBeDefined()
  })

  it('should return undefined if the data is not valid', () => {
    expect(
      parseFtMetadataRecord({
        decimals: -1,
        extra: 2,
      }),
    ).toBeUndefined()
  })
})
