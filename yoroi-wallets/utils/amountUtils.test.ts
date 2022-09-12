import {
  editedFormatter,
  formatMultiLangSeparator,
  formatSeparatorWithoutDigits,
  pastedFormatter,
  stripAllButFirstDecimalSeparator,
  stripAllButLastDecimalSeparators,
  stripCommas,
  stripExcessiveDecimals,
  stripInvalidCharacters,
} from './amountUtils'

describe('stripCommas', () => {
  it('strips all commas', () => {
    expect(stripCommas('1,23,123')).toBe('123123')
    expect(stripCommas('123,')).toBe('123')
    expect(stripCommas(',123')).toBe('123')
  })
})

describe('stripInvalidCharacters', () => {
  it('strips all non numeric and non comma/dot chars', () => {
    expect(stripInvalidCharacters('me123')).toBe('123')
    expect(stripInvalidCharacters('me123,.')).toBe('123,.')
  })
})

describe('stripInvalidCharacters', () => {
  it('strips all non numeric and non comma/dot chars', () => {
    expect(stripInvalidCharacters('me1@23')).toBe('123')
    expect(stripInvalidCharacters('me123,.')).toBe('123,.')
  })
})

describe('formatMultilineSeparator', () => {
  it('changes commas into dots', () => {
    expect(formatMultiLangSeparator('132,123,')).toBe('132.123.')
    expect(formatMultiLangSeparator(',')).toBe('.')
  })
})

describe('formatSeparatorWithoutDigits', () => {
  it('adds 0 before . if not present', () => {
    expect(formatSeparatorWithoutDigits('.')).toBe('0.')
  })
})

describe('stripExcessiveDecimals', () => {
  it('strips all decimal numbers after 6th', () => {
    expect(stripExcessiveDecimals('123.12345678')).toBe('123.123456')
  })
})

describe('stripAllButFirstDecimalSeparator', () => {
  it('strips all but first decimal separator', () => {
    expect(stripAllButFirstDecimalSeparator('123.125.67.8')).toBe('123.125678')
  })
})

describe('stripAllButLastDecimalSeparator', () => {
  it('strips all but last decimal separator', () => {
    expect(stripAllButLastDecimalSeparators('123.125.67.8')).toBe('12312567.8')
  })
})

describe('pastedFormatter', () => {
  it('ignores commas', () => {
    expect(pastedFormatter('123,456')).toBe('123456')
  })

  it('accepts last dot as decimal separator', () => {
    expect(pastedFormatter('123.456.789')).toBe('123456.789')
  })

  it('strips unwanted chars', () => {
    expect(pastedFormatter('1asdd2q we@3')).toBe('123')
  })

  it('allows max 6 decimals', () => {
    expect(pastedFormatter('123.12345678')).toBe('123.123456')
  })
})

describe('editedFormatter', () => {
  it('changes comma into dot', () => {
    expect(editedFormatter('123,456')).toBe('123.456')
  })

  it('does not allow non-numeric chars', () => {
    expect(editedFormatter('123a')).toBe('123')
  })

  it('allows max 6 decimals', () => {
    expect(editedFormatter('123.12345678')).toBe('123.123456')
  })
})
