import {Quantities} from './quantities'
import {asQuantity} from './asQuantity'
import {Balance} from '@yoroi/types'
import {mockNumberLocale} from '../adapters/intl/number-locale.mocks'

describe('Quantities', () => {
  describe('sum', () => {
    it('should calculate the sum of quantities', () => {
      const quantities = [asQuantity(100), asQuantity(200), asQuantity(300)]
      expect(Quantities.sum(quantities)).toBe('600')
    })
  })

  describe('diff', () => {
    it('should calculate the difference between two quantities', () => {
      const quantity1 = '500'
      const quantity2 = '300'
      expect(Quantities.diff(quantity1, quantity2)).toBe('200')
    })
  })

  describe('product', () => {
    it('should calculate the product of quantities', () => {
      const quantities = [asQuantity(2), asQuantity(3), asQuantity(4)]
      expect(Quantities.product(quantities)).toBe('24')
    })
  })

  describe('quotient', () => {
    it('should calculate the quotient between two quantities', () => {
      const quantity1 = '1000'
      const quantity2 = '5'
      expect(Quantities.quotient(quantity1, quantity2)).toBe('200')
    })
  })

  describe('isGreaterThanOrEqualTo', () => {
    it('should correctly compare two quantities', () => {
      const quantity1 = '100'
      const quantity2 = '50'
      expect(Quantities.isGreaterThanOrEqualTo(quantity1, quantity2)).toBe(true)
    })

    it('should handle equal quantities', () => {
      const quantity1 = '100'
      const quantity2 = '100'
      expect(Quantities.isGreaterThanOrEqualTo(quantity1, quantity2)).toBe(true)
    })

    it('should handle negative quantities', () => {
      const quantity1 = '-50'
      const quantity2 = '-100'
      expect(Quantities.isGreaterThanOrEqualTo(quantity1, quantity2)).toBe(true)
    })
  })

  describe('isGreaterThan', () => {
    it('should correctly compare two quantities', () => {
      const quantity1 = '100'
      const quantity2 = '50'
      expect(Quantities.isGreaterThan(quantity1, quantity2)).toBe(true)
    })

    it('should handle equal quantities', () => {
      const quantity1 = '100'
      const quantity2 = '100'
      expect(Quantities.isGreaterThan(quantity1, quantity2)).toBe(false)
    })

    it('should handle negative quantities', () => {
      const quantity1 = '-50'
      const quantity2 = '-100'
      expect(Quantities.isGreaterThan(quantity1, quantity2)).toBe(true)
    })
  })

  describe('isZero', () => {
    it('should correctly identify zero quantities', () => {
      const zeroQuantity = '0'
      const nonZeroQuantity = '100'
      expect(Quantities.isZero(zeroQuantity)).toBe(true)
      expect(Quantities.isZero(nonZeroQuantity)).toBe(false)
    })
  })

  describe('integer', () => {
    it('should convert a quantity to an integer', () => {
      const quantity = '0.00123'
      const denomination = 6
      expect(Quantities.integer(quantity, denomination)).toBe('1230')
    })
  })

  describe('denominated', () => {
    it('should correctly denominate a quantity', () => {
      const quantity = '10000'
      const denomination = 6
      expect(Quantities.denominated(quantity, denomination)).toBe('0.01')
    })
  })

  describe('negated', () => {
    it('should negate a positive quantity', () => {
      const quantity = '500'
      expect(Quantities.negated(quantity)).toBe('-500')
    })

    it('should negate a negative quantity', () => {
      const quantity = '-750'
      expect(Quantities.negated(quantity)).toBe('750')
    })

    it('should leave zero unchanged', () => {
      const quantity = '0'
      expect(Quantities.negated(quantity)).toBe('0')
    })
  })

  describe('decimalPlaces', () => {
    it('should change the number of decimal places in a quantity', () => {
      const quantity = '123.456789'
      const precision = 3
      expect(Quantities.decimalPlaces(quantity, precision)).toBe('123.457')
    })

    it('should remove excess decimal places', () => {
      const quantity = '123.456789'
      const precision = 2
      expect(Quantities.decimalPlaces(quantity, precision)).toBe('123.46')
    })
  })

  describe('isAtomic', () => {
    it('should correctly identify atomic quantities', () => {
      const atomicQuantity = '0.01'
      const nonAtomicQuantity = '0.015'
      const denomination = 2
      expect(Quantities.isAtomic(atomicQuantity, denomination)).toBe(true)
      expect(Quantities.isAtomic(nonAtomicQuantity, denomination)).toBe(false)
    })
  })

  describe('format', () => {
    it('should format a quantity with the specified denomination', () => {
      const quantity = '0.01'
      const denomination = 2
      expect(Quantities.format(quantity, denomination)).toBe('0.0001')
    })

    it('should format a quantity with the specified denomination and precision', () => {
      const quantity = '0.01'
      const denomination = 2
      const precision = 1
      expect(Quantities.format(quantity, denomination, precision)).toBe('0')
    })
  })

  it('should find the maximum quantity from an array of quantities', () => {
    const quantities: Array<Balance.Quantity> = [
      asQuantity(100),
      asQuantity(500),
      asQuantity(300),
      asQuantity(700),
      asQuantity(200),
    ]
    const maxQuantity = Quantities.max(...quantities) // Convert strings to numbers
    expect(maxQuantity).toBe('700')
  })

  it('should parse "0" when the input text is an empty string', () => {
    const text = ''
    const denomination = 2
    const [input, quantity] = Quantities.parseFromText(
      text,
      denomination,
      mockNumberLocale,
    )

    expect(input).toBe('')
    expect(quantity).toBe('0')
  })

  it('should parse "0" when the input text is an decimal separator', () => {
    const text = '.'
    const denomination = 2
    const [input, quantity] = Quantities.parseFromText(
      text,
      denomination,
      mockNumberLocale,
    )

    expect(input).toBe('0.')
    expect(quantity).toBe('0')
  })

  it('should parse "1.0" when the input text has trailing 0', () => {
    expect(Quantities.parseFromText('1.0', 2, mockNumberLocale)).toEqual([
      '1.0',
      '100',
    ])
  })

  it('should parse "1.234" when precision is 3', () => {
    expect(Quantities.parseFromText('1.23456', 0, mockNumberLocale, 3)).toEqual(
      ['1.234', '1.234'],
    )

    expect(Quantities.parseFromText('1.23456', 2, mockNumberLocale, 3)).toEqual(
      ['1.234', '123.4'],
    )
  })

  it('should parse whole numbers', () => {
    expect(Quantities.parseFromText('123', 2, mockNumberLocale)).toEqual([
      '123',
      '12300',
    ])
  })
})
