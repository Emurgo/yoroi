import tinycolor from 'tinycolor2'

export const colorSaturation = (color: string, factor: number): string => {
  if (factor < -100 || factor > 100) {
    throw new Error(
      '[@yoroi/identicon] Expected factor between -100 and 100 (default 0)',
    )
  }

  let tcol = tinycolor(color)
  const absFactor = Math.abs(factor)
  factor < 0 ? tcol.desaturate(absFactor) : tcol.saturate(absFactor)

  return tcol.toHexString()
}
