import {init} from '@emurgo/cross-csl-nodejs'
import {cnsCardanoApiMock} from './cardano-api-maker.mocks'
import {AssocMap, BuiltinByteString, CNSUserRecord} from './types'
import {
  hexToString,
  objToHex,
  parseAssocMapAsync,
  parsePlutusAddressToBech32,
  validateCNSUserRecord,
  validateExpiry,
  validateVirtualSubdomainEnabled,
} from './utils'

describe('validateCNSUserRecord', () => {
  it('returns true when the record is correct', () => {
    const result = validateCNSUserRecord(
      cnsCardanoApiMock.inlineDatumMock[0]?.inline_datum
        .plutus_data as CNSUserRecord,
    )

    expect(result).toBe(true)
  })

  it('returns false: incorrect constructor', () => {
    const result = validateCNSUserRecord(
      cnsCardanoApiMock.badConstructorInlineDatumMock[0]?.inline_datum
        .plutus_data as CNSUserRecord,
    )

    expect(result).toBe(false)
  })

  it('returns false: incorrect fields', () => {
    const result = validateCNSUserRecord(
      cnsCardanoApiMock.badFieldsInlineDatumMock[0]?.inline_datum
        .plutus_data as CNSUserRecord,
    )

    expect(result).toBe(false)
  })
})

describe('validateExpiry', () => {
  it('returns true', () => {
    const result = validateExpiry(cnsCardanoApiMock.metadataMock)

    expect(result).toBe(true)
  })

  it('returns false', () => {
    const result = validateExpiry(cnsCardanoApiMock.expiredMetadataMock)

    expect(result).toBe(false)
  })
})

describe('validateVirtualSubdomainEnabled', () => {
  it('returns true', () => {
    const result = validateVirtualSubdomainEnabled(
      cnsCardanoApiMock.metadataMock,
    )

    expect(result).toBe(true)
  })

  it('returns false', () => {
    const result = validateVirtualSubdomainEnabled(
      cnsCardanoApiMock.disabledMetadataMock,
    )

    expect(result).toBe(false)
  })
})

describe('parseAssocMapAsync', () => {
  it('successfully parses valid input', async () => {
    const mockItemParser = jest.fn((item) => Promise.resolve(`Parsed: ${item}`))
    const mockAssocMapVal = {
      map: Array(10)
        .fill(null)
        .map((_, i) => ({k: {bytes: `key${i}`}, v: `value${i}`})),
    }

    const expectedResult = mockAssocMapVal.map
      .map((item, i) => [hexToString(item.k.bytes), `Parsed: value${i}`])
      .slice(0, 5)

    const result = await parseAssocMapAsync(mockAssocMapVal, mockItemParser)

    expect(mockItemParser).toHaveBeenCalledTimes(5)
    expect(result).toEqual(expectedResult)
  })

  it('throws an error for bad data', async () => {
    const mockAssocMapVal: AssocMap<BuiltinByteString, unknown> = {
      //@ts-ignore
      map: [undefined],
    }
    const mockItemParser = jest.fn()

    await expect(
      parseAssocMapAsync(mockAssocMapVal, mockItemParser),
    ).rejects.toThrow('bad data')
  })

  it('throws an error when itemParser returns a falsy value', async () => {
    const mockItemParser = jest
      .fn()
      .mockResolvedValueOnce('Valid Data')
      .mockResolvedValueOnce(null)

    const mockAssocMapVal = {
      map: [
        {k: {bytes: 'key1'}, v: 'value1'},
        {k: {bytes: 'key2'}, v: 'value2'},
      ],
    }

    await expect(
      parseAssocMapAsync(mockAssocMapVal, mockItemParser, 2),
    ).rejects.toThrow('bad data')

    expect(mockItemParser).toHaveBeenCalledTimes(2)
    expect(mockItemParser).toHaveBeenCalledWith('value1')
    expect(mockItemParser).toHaveBeenCalledWith('value2')
  })

  it('respects the limit parameter', async () => {
    const mockItemParser = jest.fn((item) => Promise.resolve(`Parsed: ${item}`))
    const limit = 3
    const mockAssocMapVal = {
      map: Array(10)
        .fill(null)
        .map((_, i) => ({k: {bytes: `key${i}`}, v: `value${i}`})),
    }

    await parseAssocMapAsync(mockAssocMapVal, mockItemParser, limit)

    expect(mockItemParser).toHaveBeenCalledTimes(limit)
  })
})

const item1 = {
  constructor: 0,
  fields: [
    {
      constructor: 0,
      fields: [
        {
          bytes: 'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
        },
      ],
    },
    {
      constructor: 0,
      fields: [
        {
          constructor: 0,
          fields: [
            {
              constructor: 0,
              fields: [
                {
                  bytes:
                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const item2 = {
  constructor: 0,
  fields: [
    {
      constructor: 1,
      fields: [
        {
          bytes: 'a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84',
        },
      ],
    },
    {
      constructor: 0,
      fields: [
        {
          constructor: 0,
          fields: [
            {
              constructor: 0,
              fields: [
                {
                  bytes:
                    'e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe('objToHex', () => {
  it('successfully converts to hex', async () => {
    const result = await objToHex(item1, init('ctx'))
    expect(result).toBe(
      'd8799fd8799f581ca5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84ffd8799fd8799fd8799f581ce40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71dfffffffff',
    )
  })
})

describe('parsePlutusAddressToBech32', () => {
  it('successfully converts to Bech32: pub key credential', async () => {
    const hex = await objToHex(item1, init('ctx'))
    const result = await parsePlutusAddressToBech32(hex, init('ctx'), 1)
    expect(result).toBe(
      'addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs',
    )
  })

  it('successfully converts to Bech32: script credential', async () => {
    const hex = await objToHex(item2, init('ctx'))
    const result = await parsePlutusAddressToBech32(hex, init('ctx'), 1)
    expect(result).toBe(
      'addr1zxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80s0xayjy',
    )
  })
})
