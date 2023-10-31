import {asYoroiLocale} from './asYoroiLocale'

describe('asYoroiLocale', () => {
  it.each`
    locale     | expected
    ${'en_US'} | ${'en-US'}
    ${'pt_BR'} | ${'pt-BR'}
    ${'fr-FR'} | ${'fr-FR'}
    ${''}      | ${'en-US'}
    ${'xx_YZ'} | ${'en-US'}
  `('should convert $locale to $expected', ({locale, expected}) => {
    expect(asYoroiLocale(locale)).toEqual(expected)
  })
})
