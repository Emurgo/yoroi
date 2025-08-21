import {
  CurrencySymbolSchema,
  isCurrencySymbol,
  parseCurrencySymbol,
} from './currency-symbol'

describe('CurrencySymbolSchema', () => {
  it.each([
    ['valid currency symbol', 'ADA', true],
    ['valid currency symbol', 'BRL', true],
    ['valid currency symbol', 'BTC', true],
    ['valid currency symbol', 'CNY', true],
    ['valid currency symbol', 'ETH', true],
    ['valid currency symbol', 'EUR', true],
    ['valid currency symbol', 'JPY', true],
    ['valid currency symbol', 'KRW', true],
    ['valid currency symbol', 'USD', true],
    ['invalid currency symbol', 'INVALID', false],
    ['invalid currency symbol', 'ada', false],
    ['invalid currency symbol', 'btc', false],
    ['invalid currency symbol', '', false],
    ['invalid currency symbol', null, false],
    ['invalid currency symbol', undefined, false],
    ['invalid currency symbol', 123, false],
    ['invalid currency symbol', {}, false],
    ['invalid currency symbol', [], false],
  ])('%s: %p should be %p', (_, input, expected) => {
    const result = CurrencySymbolSchema.safeParse(input)
    expect(result.success).toBe(expected)
  })
})

describe('isCurrencySymbol', () => {
  it.each([
    ['valid currency symbol', 'ADA', true],
    ['valid currency symbol', 'BRL', true],
    ['valid currency symbol', 'BTC', true],
    ['valid currency symbol', 'CNY', true],
    ['valid currency symbol', 'ETH', true],
    ['valid currency symbol', 'EUR', true],
    ['valid currency symbol', 'JPY', true],
    ['valid currency symbol', 'KRW', true],
    ['valid currency symbol', 'USD', true],
    ['invalid currency symbol', 'INVALID', false],
    ['invalid currency symbol', 'ada', false],
    ['invalid currency symbol', 'btc', false],
    ['invalid currency symbol', '', false],
    ['invalid currency symbol', null, false],
    ['invalid currency symbol', undefined, false],
    ['invalid currency symbol', 123, false],
    ['invalid currency symbol', {}, false],
    ['invalid currency symbol', [], false],
  ])('%s: %p should be %p', (_, input, expected) => {
    const result = isCurrencySymbol(input)
    expect(result).toBe(expected)
  })
})

describe('parseCurrencySymbol', () => {
  it.each([
    ['valid currency symbol', 'ADA', 'ADA'],
    ['valid currency symbol', 'BRL', 'BRL'],
    ['valid currency symbol', 'BTC', 'BTC'],
    ['valid currency symbol', 'CNY', 'CNY'],
    ['valid currency symbol', 'ETH', 'ETH'],
    ['valid currency symbol', 'EUR', 'EUR'],
    ['valid currency symbol', 'JPY', 'JPY'],
    ['valid currency symbol', 'KRW', 'KRW'],
    ['valid currency symbol', 'USD', 'USD'],
    ['invalid currency symbol', 'INVALID', undefined],
    ['invalid currency symbol', 'ada', undefined],
    ['invalid currency symbol', 'btc', undefined],
    ['invalid currency symbol', '', undefined],
    ['invalid currency symbol', null, undefined],
    ['invalid currency symbol', undefined, undefined],
    ['invalid currency symbol', 123, undefined],
    ['invalid currency symbol', {}, undefined],
    ['invalid currency symbol', [], undefined],
  ])('%s: %p should return %p', (_, input, expected) => {
    const result = parseCurrencySymbol(input)
    expect(result).toBe(expected)
  })
})
