import {parseThemeConfig} from './parse-theme-config'

describe('parseThemeConfig', () => {
  it.each`
    input                | expected
    ${'"default-light"'} | ${'default-light'}
    ${'"default-dark"'}  | ${'default-dark'}
    ${'"system"'}        | ${'system'}
  `(
    'should return $expected for valid theme name: $input',
    ({input, expected}) => {
      expect(parseThemeConfig(input)).toBe(expected)
    },
  )

  it.each`
    input                | expected
    ${'"invalid-theme"'} | ${'system'}
    ${'"light"'}         | ${'system'}
    ${'"dark"'}          | ${'system'}
    ${'""'}              | ${'system'}
    ${null}              | ${'system'}
    ${undefined}         | ${'system'}
    ${'123'}             | ${'system'}
    ${'{}'}              | ${'system'}
    ${'[]'}              | ${'system'}
  `(
    'should return $expected for invalid input: $input',
    ({input, expected}) => {
      expect(parseThemeConfig(input)).toBe(expected)
    },
  )
})
