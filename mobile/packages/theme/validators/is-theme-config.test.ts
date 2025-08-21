import {isThemeConfig} from './is-theme-config'

describe('isThemeConfig', () => {
  it.each`
    themeName          | expected
    ${'default-light'} | ${true}
    ${'default-dark'}  | ${true}
    ${'system'}        | ${true}
  `(
    'should return $expected for theme name: $themeName',
    ({themeName, expected}) => {
      expect(isThemeConfig(themeName)).toBe(expected)
    },
  )

  it.each`
    themeName          | expected
    ${'invalid-theme'} | ${false}
    ${'light'}         | ${false}
    ${'dark'}          | ${false}
    ${''}              | ${false}
    ${null}            | ${false}
    ${undefined}       | ${false}
    ${123}             | ${false}
    ${{}}              | ${false}
    ${[]}              | ${false}
  `(
    'should return $expected for theme name: $themeName',
    ({themeName, expected}) => {
      expect(isThemeConfig(themeName)).toBe(expected)
    },
  )
})
