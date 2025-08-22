export interface Hex {
  readonly value: string
  readonly bytes: Uint8Array
  readonly utf8: string
  equals(other: Hex): boolean
}

export function hex(value: string): Hex {
  if (!hex.isHexString(value)) {
    throw new Error('Invalid hex string')
  }

  return {
    get value() {
      return value.toLowerCase()
    },
    get bytes() {
      return new Uint8Array(Buffer.from(value, 'hex'))
    },
    get utf8() {
      return Buffer.from(value, 'hex').toString('utf8')
    },
    equals(other: Hex) {
      return this.value === other.value
    },
  }
}

hex.isHexString = (str: string) => /^[0-9a-fA-F]+$/.test(str)

hex.fromUtf8 = (str: string) => hex(Buffer.from(str, 'utf8').toString('hex'))

hex.fromBytes = (bytes: Uint8Array) => hex(Buffer.from(bytes).toString('hex'))
