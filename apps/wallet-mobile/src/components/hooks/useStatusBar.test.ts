import {simulateOpacity} from './useStatusBar'

describe('simulateOpacity', () => {
  test('halves intensity of a hex color without alpha channel', () => {
    expect(simulateOpacity('#224466')).toEqual('#112233')
  })

  test('halves intensity of a hex color and preserves alpha channel', () => {
    expect(simulateOpacity('#22446680')).toEqual('#11223380')
  })

  test('returns the same color for improperly formatted hex codes', () => {
    // Too short
    expect(simulateOpacity('#12345')).toEqual('#12345')
    // Not a hex code
    expect(simulateOpacity('G12345' as never)).toEqual('G12345')
    // Missing hash
    expect(simulateOpacity('224466' as never)).toEqual('224466')
    // Too long
    expect(simulateOpacity('#123456789')).toEqual('#123456789')
  })

  test('correctly processes the lowest intensity values', () => {
    expect(simulateOpacity('#010101')).toEqual('#000000')
  })

  test('correctly processes the highest intensity values', () => {
    expect(simulateOpacity('#FFFFFF')).toEqual('#7f7f7f')
  })

  test('handles lower and upper case hex codes equally', () => {
    expect(simulateOpacity('#abcdef')).toEqual('#556677')
    expect(simulateOpacity('#ABCDEF')).toEqual('#556677')
  })

  test('boundary conditions are handled correctly', () => {
    expect(simulateOpacity('#000000')).toEqual('#000000')
    expect(simulateOpacity('#FFFFFF')).toEqual('#7f7f7f')
    expect(simulateOpacity('#FF0000')).toEqual('#7f0000')
  })

  test('expands and halves intensity of a shorthand hex color without alpha', () => {
    expect(simulateOpacity('#246')).toEqual('#112233')
  })

  test('expands and halves intensity of a shorthand hex color with alpha', () => {
    expect(simulateOpacity('#2468')).toEqual('#11223388')
  })
})
