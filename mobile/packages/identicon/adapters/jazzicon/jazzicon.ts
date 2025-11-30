import MersenneTwister from 'mersenne-twister'
import tinycolor from 'tinycolor2'

import {colorScheme} from './color-scheme'

export const initialShapeCount = 3
export const initialWobble = 30
export const initialSize = 100

interface JazziconOptions {
  seed: string
  shapeCount?: number
  wobble?: number
  colors?: ReadonlyArray<string>
  size?: number
}

interface JazziconInstance {
  asBase64(options?: {size: number}): string
}

/**
 * Creates a Jazzicon instance for generating identicons from a seed
 *
 * @param options - The options for creating the Jazzicon instance
 * @param options.seed - The seed used for generating the identicon **(must be hex)**
 * @param options.shapeCount - The number of shapes to generate (default: 3)
 * @param options.wobble - The wobble factor for color shifting (default: 30)
 * @param options.colors - The base color scheme (default: colorScheme)
 * @returns {JazziconInstance} An object with methods to generate identicons
 * @throws {Error} If the seed is invalid, too short, or shape count is too high
 */
export function Jazzicon({
  seed,
  shapeCount = initialShapeCount,
  wobble = initialWobble,
  colors = colorScheme,
}: JazziconOptions): JazziconInstance {
  if (shapeCount + 1 > colors.length)
    throw new Error('Insufficient colors, shape count too high.')
  if (!seed.match(/^[0-9a-fA-F]+$/))
    throw new Error('Seed must be a valid hexadecimal string.')
  if (seed.length < 10)
    throw new Error('Seed must be at least 10 characters long.')

  const generator = new MersenneTwister()

  const nextColor = (shiftedColors: string[]): string => {
    const index = Math.floor(generator.random() * shiftedColors.length)
    return shiftedColors.splice(index, 1)[0]!
  }

  const nextTransform = (index: number): string => {
    const angle = 2 * Math.PI * generator.random()
    const velocity = (100 * (index + generator.random())) / shapeCount
    const x = Math.cos(angle) * velocity
    const y = Math.sin(angle) * velocity
    const rotation = generator.random() * 360 + generator.random() * 180
    return `translate(${x.toFixed(3)} ${y.toFixed(
      3,
    )}) rotate(${rotation.toFixed(1)} 50 50)`
  }

  /**
   * Generates a base64-encoded SVG identicon
   *
   * @param options - The options for generating the identicon
   * @param options.size - The size of the identicon (default: 100)
   * @returns {string} The base64-encoded SVG image
   */
  const asBase64 = ({size}: {size: number} = {size: initialSize}): string => {
    const seedSlice = parseInt(seed.slice(2, 10), 16)
    generator.init_seed(seedSlice)
    const position = generator.random()
    const hueShift = 30 * position - wobble / 2
    const shiftedColors = colors.map((hex) =>
      tinycolor(hex).spin(hueShift).toHexString(),
    )

    // Create a mutable copy for nextColor to splice from
    const mutableColors = [...shiftedColors]

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" x="0" y="0" viewBox="0 0 100 100">`
    svgContent += `<rect x="0" y="0" width="100%" height="100%" fill="${nextColor(mutableColors)}" />`

    for (let i = 0; i < shapeCount; i++) {
      svgContent += `<rect x="0" y="0" width="100%" height="100%" transform="${nextTransform(
        i,
      )}" fill="${nextColor(mutableColors)}" />`
    }

    svgContent += '</svg>'

    const base64String = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64String}`
  }

  return {
    asBase64,
  }
}
