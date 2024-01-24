import {PRIMARY_TOKEN} from '../yoroi-wallets/cardano/constants/mainnet/constants'
import {asQuantity} from '../yoroi-wallets/utils'
import {formatTokenAmount, formatTokenFractional, formatTokenInteger} from './format'

const defaultCardanoAsset = PRIMARY_TOKEN

describe('formatAda', () => {
  it('formats zero', () => {
    expect(formatTokenAmount(asQuantity(0), defaultCardanoAsset)).toEqual('0.000000')
  })

  it('formats positive', () => {
    const tests = [
      ['12', '0.000012'],
      ['999999', '0.999999'],
      ['1000000', '1.000000'],
      ['1000001', '1.000001'],
      ['9999999', '9.999999'],
      ['9999999000000', '9,999,999.000000'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenAmount(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
  it('formats negative', () => {
    const tests = [
      ['-12', '-0.000012'],
      ['-999999', '-0.999999'],
      ['-1000000', '-1.000000'],
      ['-1000001', '-1.000001'],
      ['-9999999', '-9.999999'],
      ['-9999999000000', '-9,999,999.000000'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenAmount(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
})

describe('formatAdaFractional', () => {
  it('formats zero', () => {
    expect(formatTokenFractional(asQuantity(0), defaultCardanoAsset)).toEqual('.000000')
  })

  it('formats positive', () => {
    const tests = [
      ['12', '.000012'],
      ['999999', '.999999'],
      ['1000000', '.000000'],
      ['1000001', '.000001'],
      ['9999999', '.999999'],
      ['9999999000000', '.000000'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenFractional(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
  it('formats negative', () => {
    const tests = [
      ['-12', '.000012'],
      ['-999999', '.999999'],
      ['-1000000', '.000000'],
      ['-1000001', '.000001'],
      ['-9999999', '.999999'],
      ['-9999999000000', '.000000'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenFractional(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
})

describe('formatAdaInteger', () => {
  it('formats zero', () => {
    expect(formatTokenInteger(asQuantity(0), defaultCardanoAsset)).toEqual('0')
  })

  it('formats positive', () => {
    const tests = [
      ['12', '0'],
      ['999999', '0'],
      ['1000000', '1'],
      ['1000001', '1'],
      ['1999999', '1'],
      ['9999999', '9'],
      ['9999999000000', '9,999,999'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenInteger(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
  it('formats negative', () => {
    const tests = [
      ['-12', '-0'],
      ['-999999', '-0'],
      ['-1000000', '-1'],
      ['-1000001', '-1'],
      ['-1999999', '-1'],
      ['-9999999', '-9'],
      ['-9999999000000', '-9,999,999'],
    ]
    tests.forEach(([ada, formatted]) => {
      expect(formatTokenInteger(asQuantity(ada), defaultCardanoAsset)).toEqual(formatted)
    })
  })
})
