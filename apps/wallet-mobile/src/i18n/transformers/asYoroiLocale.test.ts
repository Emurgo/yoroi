import {asYoroiLocale} from './asYoroiLocale'

describe.each`
  locale     | expected
  ${'en_US'} | ${'en-US'}
  ${'pt_BR'} | ${'pt-BR'}
  ${'fr-FR'} | ${'fr-FR'}
  ${''}      | ${'en-US'}
  ${'xx_YZ'} | ${'en-US'}
`('asYoroiLocale', ({locale, expected}) => {
  it(`should convert ${locale} to ${expected}`, () => {
    expect(asYoroiLocale(locale)).toEqual(expected)
  })
})
