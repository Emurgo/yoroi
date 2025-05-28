import {parseThemeName} from './parse-theme-name'

describe('parseThemeName', () => {
  it.each`
    input                | expected
    ${'"default-light"'} | ${'default-light'}
    ${'"default-dark"'}  | ${'default-dark'}
    ${'"system"'}        | ${'system'}
  `(
    'should return $expected for valid theme name: $input',
    ({input, expected}) => {
      expect(parseThemeName(input)).toBe(expected)
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
      expect(parseThemeName(input)).toBe(expected)
    },
  )
})
