import {banxaIsPossibleCardanoAddress} from './wallet-address'

describe('banxaIsPossibleCardanoAddress', () => {
  // Test valid Byron addresses
  test('should return false for valid Byron mainnet addresses', () => {
    expect(
      banxaIsPossibleCardanoAddress(
        'Ae2tdPwUPEZ5VwwZpNmy1ruH7mfmGv4JDqY4RiUZsMUTVDcsSsSh2Gu5noo',
      ),
    ).toBe(false)
    expect(
      banxaIsPossibleCardanoAddress(
        'Ae2tdPwUPEZMK3H6mAmaSB1E4dGvcwRTe1tTkoSCNmQWBNxF6twLDwZoxt8',
      ),
    ).toBe(false)
  })

  // Test valid Shelley addresses
  test('should return true for valid Shelley mainnet addresses', () => {
    expect(
      banxaIsPossibleCardanoAddress(
        'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3a6tavy5ndt3mw0mf9hskzg9q9nrg9kxxlt9jvl4ymkhdq6rs0vt',
      ),
    ).toBe(true)
    expect(
      banxaIsPossibleCardanoAddress(
        'addr1qxlzhn7wya6s2c3x6px63hklwt2ss9f8s0v5c90v6w8wtfl5mv6m2tckwqlyvlwmnx9ct68fqk7nngeja4kvz65prdrquaj4lfl',
      ),
    ).toBe(true)
  })

  // Test valid Shelley testnet addresses
  test('should return false for valid Shelley testnet addresses', () => {
    expect(
      banxaIsPossibleCardanoAddress(
        'addr_test1q9xwspw7mcmrhlzsp5v3xxvtzgqhp5tkmdt6zydu9evmvg28gr8v6svtefqgghsk93y4qqtv7kjeg5k06c8qxy4r89agqheknqv',
      ),
    ).toBe(false)
    expect(
      banxaIsPossibleCardanoAddress(
        'addr_test1qqlzhn7wya6s2c3x6px63hklwt2ss9f8s0v5c90v6w8wtfl5mv6m2tckwqlyvlwmnx9ct68fqk7nngeja4kvz65prdrqudmm25h',
      ),
    ).toBe(false)
  })

  // Test invalid addresses
  test('should return false for invalid addresses', () => {
    expect(banxaIsPossibleCardanoAddress('invalidaddress123')).toBe(false)
    expect(banxaIsPossibleCardanoAddress('0x1234567890abcdef')).toBe(false)
    expect(
      banxaIsPossibleCardanoAddress(
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      ),
    ).toBe(false)
  })
})
