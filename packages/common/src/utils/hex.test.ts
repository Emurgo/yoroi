import {hex} from './hex'

describe('hex', () => {
  describe('isHexString', () => {
    it.each([
      {
        input: '1234567890abcdef',
        expected: true,
        description: 'valid hex string',
      },
      {
        input: '1234567890ABCDEF',
        expected: true,
        description: 'valid hex string with uppercase',
      },
      {
        input: '1234567890abcdef1234567890abcdef',
        expected: true,
        description: 'long valid hex string',
      },
      {input: '', expected: false, description: 'empty string'},
      {
        input: '1234567890abcdefg',
        expected: false,
        description: 'invalid hex character',
      },
      {
        input: '1234567890abcdef ',
        expected: false,
        description: 'hex string with space',
      },
      {
        input: '0x1234567890abcdef',
        expected: false,
        description: 'hex string with 0x prefix',
      },
    ])('should return $expected for $description', ({input, expected}) => {
      expect(hex.isHexString(input)).toBe(expected)
    })
  })

  describe('constructor', () => {
    it.each([
      {input: '1234567890abcdef', description: 'valid hex string'},
      {
        input: '1234567890ABCDEF',
        description: 'valid hex string with uppercase',
      },
    ])('should create instance with $description', ({input}) => {
      const h = hex(input)
      expect(h.value).toBe(input.toLowerCase())
    })

    it.each([
      {input: 'invalid', description: 'non-hex string'},
      {
        input: '1234567890abcdefg',
        description: 'string with invalid hex character',
      },
      {input: '0x1234567890abcdef', description: 'string with 0x prefix'},
      {input: '', description: 'empty string'},
    ])('should throw error for $description', ({input}) => {
      expect(() => hex(input)).toThrow('Invalid hex string')
    })
  })

  describe('fromUtf8', () => {
    it.each([
      {
        input: 'Hello',
        expected: '48656c6c6f',
        description: 'simple ASCII string',
      },
      {
        input: 'Hello World!',
        expected: '48656c6c6f20576f726c6421',
        description: 'ASCII string with spaces',
      },
      {
        input: 'こんにちは',
        expected: 'e38193e38293e381abe381a1e381af',
        description: 'UTF-8 string',
      },
    ])('should convert $description to hex', ({input, expected}) => {
      expect(hex.fromUtf8(input).value).toBe(expected)
    })
  })

  describe('fromBytes', () => {
    it.each([
      {
        input: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        expected: '48656c6c6f',
        description: 'ASCII bytes',
      },
      {
        input: new Uint8Array([0xff, 0xfe, 0xfd]),
        expected: 'fffefd',
        description: 'arbitrary bytes',
      },
    ])('should convert $description to hex', ({input, expected}) => {
      expect(hex.fromBytes(input).value).toBe(expected)
    })
  })

  describe('bytes', () => {
    it.each([
      {
        input: '48656c6c6f',
        expected: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        description: 'ASCII hex',
      },
      {
        input: 'fffefd',
        expected: new Uint8Array([0xff, 0xfe, 0xfd]),
        description: 'arbitrary hex',
      },
    ])('should convert $description to bytes', ({input, expected}) => {
      const h = hex(input)
      expect(h.bytes).toEqual(expected)
    })
  })

  describe('utf8', () => {
    it.each([
      {input: '48656c6c6f', expected: 'Hello', description: 'ASCII hex'},
      {
        input: '48656c6c6f20576f726c6421',
        expected: 'Hello World!',
        description: 'ASCII hex with spaces',
      },
      {
        input: 'e38193e38293e381abe381a1e381af',
        expected: 'こんにちは',
        description: 'UTF-8 hex',
      },
    ])('should convert $description to UTF-8 string', ({input, expected}) => {
      const h = hex(input)
      expect(h.utf8).toBe(expected)
    })
  })

  describe('value', () => {
    it.each([
      {
        input: '1234567890abcdef',
        expected: '1234567890abcdef',
        description: 'lowercase hex',
      },
      {
        input: '1234567890ABCDEF',
        expected: '1234567890abcdef',
        description: 'uppercase hex',
      },
    ])('should return $description', ({input, expected}) => {
      const h = hex(input)
      expect(h.value).toBe(expected)
    })
  })

  describe('equals', () => {
    it.each([
      {
        a: 'deadbeef',
        b: 'deadbeef',
        expected: true,
        description: 'same hex, same case',
      },
      {
        a: 'deadbeef',
        b: 'DEADBEEF',
        expected: true,
        description: 'same hex, different case',
      },
      {
        a: 'deadbeef',
        b: 'cafebabe',
        expected: false,
        description: 'different hex',
      },
    ])('should return $expected for $description', ({a, b, expected}) => {
      const hA = hex(a)
      const hB = hex(b)
      expect(hA.equals(hB)).toBe(expected)
    })
  })
})
