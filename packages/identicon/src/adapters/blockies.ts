/* eslint-disable no-bitwise */
import {colorSaturation} from './color-saturation'
import {colorScheme} from './color-scheme'

export class Blockies {
  private randseed: number[]

  constructor() {
    this.randseed = new Array(4).fill(0)
  }

  private seedrand(seed: string) {
    this.randseed.fill(0)
    for (let i = 0; i < seed.length; i++) {
      this.randseed[i % 4] =
        (this.randseed[i % 4]! << 5) -
        this.randseed[i % 4]! +
        seed.charCodeAt(i)
    }
  }

  private rand(): number {
    const t = this.randseed[0]! ^ (this.randseed[0]! << 11)
    this.randseed[0] = this.randseed[1]!
    this.randseed[1] = this.randseed[2]!
    this.randseed[2] = this.randseed[3]!
    this.randseed[3] =
      this.randseed[3]! ^ (this.randseed[3]! >> 19) ^ t ^ (t >> 8)

    return (this.randseed[3] >>> 0) / ((1 << 31) >>> 0)
  }

  private createImageData(size: number): number[] {
    const dataWidth = Math.ceil(size / 2)
    const mirrorWidth = size - dataWidth
    const data: number[] = []

    for (let y = 0; y < size; y++) {
      const row = Array.from({length: dataWidth}, () =>
        Math.floor(this.rand() * 2.3),
      )
      const mirrorRow = [...row.slice(0, mirrorWidth)].reverse()
      data.push(...row, ...mirrorRow)
    }
    return data
  }

  /**
   * Turns a wallet seed into a base64-encoded SVG imageo
   * The width and height of the image are both `size * scale` defaulting to 64x64
   *
   * @param options - The options for generating the identicon
   * @param options.seed - The seed used for generating the identicon
   * @param options.size - The size of the identicon (default: 8)
   * @param options.scale - The scale factor of the identicon (default: 8)
   * @param options.saturationFactor - The saturation factor of the identicon (default: 0)
   * @returns {string} The base64-encoded SVG image
   */
  public asBase64({
    seed,
    size = 8,
    scale = 8,
    saturationFactor = 0,
  }: {
    seed: string
    size?: number
    scale?: number
    saturationFactor?: number
  }): string {
    this.seedrand(seed)

    const colorIdx =
      seed.length < 2 ? 0 : Buffer.from(seed, 'hex')[0]! % colorScheme.length
    const colors = colorScheme[colorIdx]!

    const backgroundColor = colorSaturation(colors.primary, saturationFactor)
    const mainColor = colorSaturation(colors.secondary, saturationFactor)
    const spotColor = colorSaturation(colors.spots, saturationFactor)

    const imageData = this.createImageData(size)
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
}
