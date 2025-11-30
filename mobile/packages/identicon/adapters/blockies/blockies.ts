/* eslint-disable no-bitwise */
import {colorSaturation} from './color-saturation'
import {colorScheme} from './color-scheme'

interface BlockiesInstance {
  asBase64(options?: {
    size?: number
    scale?: number
    saturationFactor?: number
  }): string
}

/**
 * Creates a Blockies instance for generating identicons from a seed
 *
 * @param options - The options for creating the Blockies instance
 * @param options.seed - The seed used for generating the identicon **(must be hex)**
 * @returns {BlockiesInstance} An object with methods to generate identicons
 */
export function Blockies({seed}: {seed: string}): BlockiesInstance {
  const randseed = new Array(4).fill(0)

  const seedrand = (seedValue: string) => {
    randseed.fill(0)
    for (let i = 0; i < seedValue.length; i++) {
      randseed[i % 4] =
        (randseed[i % 4]! << 5) - randseed[i % 4]! + seedValue.charCodeAt(i)
    }
  }

  const rand = (): number => {
    const t = randseed[0]! ^ (randseed[0]! << 11)
    randseed[0] = randseed[1]!
    randseed[1] = randseed[2]!
    randseed[2] = randseed[3]!
    randseed[3] = randseed[3]! ^ (randseed[3]! >> 19) ^ t ^ (t >> 8)

    return (randseed[3] >>> 0) / ((1 << 31) >>> 0)
  }

  const createImageData = (size: number): number[] => {
    const dataWidth = Math.ceil(size / 2)
    const mirrorWidth = size - dataWidth
    const data: number[] = []

    for (let y = 0; y < size; y++) {
      const row = Array.from({length: dataWidth}, () =>
        Math.floor(rand() * 2.3),
      )
      const mirrorRow = [...row.slice(0, mirrorWidth)].reverse()
      data.push(...row, ...mirrorRow)
    }
    return data
  }

  // Initialize the random seed
  seedrand(seed)

  /**
   * Turns a wallet seed into a base64-encoded SVG image
   * The width and height of the image are both `size * scale` defaulting to 64x64
   *
   * @param options - The options for generating the identicon
   * @param options.size - The size of the identicon (default: 8)
   * @param options.scale - The scale factor of the identicon (default: 8)
   * @param options.saturationFactor - The saturation factor of the identicon (default: 0)
   * @returns {string} The base64-encoded SVG image
   * @throws {Error} If the seed is not a valid hex
   */
  const asBase64 = ({
    size = 8,
    scale = 8,
    saturationFactor = 0,
  }: {
    size?: number
    scale?: number
    saturationFactor?: number
  } = {}): string => {
    const colorIdx =
      seed.length < 2 ? 0 : Buffer.from(seed, 'hex')[0]! % colorScheme.length

    const colors = colorScheme[colorIdx]!

    const backgroundColor = colorSaturation(colors.primary, saturationFactor)
    const mainColor = colorSaturation(colors.secondary, saturationFactor)
    const spotColor = colorSaturation(colors.spots, saturationFactor)

    const imageData = createImageData(size)
    const width = size * scale
    const height = size * scale

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`

    imageData.forEach((item, i) => {
      const fill =
        item === 0 ? backgroundColor : item === 1 ? mainColor : spotColor
      const row = Math.floor(i / size)
      const col = i % size
      svgContent += `<rect x="${col * scale}" y="${
        row * scale
      }" width="${scale}" height="${scale}" fill="${fill}" />`
    })

    svgContent += '</svg>'

    const base64String = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64String}`
  }

  return {
    asBase64,
  }
}
