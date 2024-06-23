import {colorSaturation} from '../adapters/color-saturation'

describe('colorSaturation', () => {
  it('should return the color with the specified saturation factor', () => {
    const color = '#ff0000'
    const factor = -50
    const desaturated = colorSaturation(color, factor)
    expect(desaturated).toEqual('#bf4040')
    const saturated = colorSaturation(color, -factor)
    expect(saturated).toEqual('#ff0000')
  })

  it('should throw an error if the factor is out of range', () => {
    const color = '#ff0000'
    const factor = 150
    expect(() => colorSaturation(color, factor)).toThrow(
      '[@yoroi/identicon] Expected factor between -100 and 100 (default 0)',
    )
  })
})
