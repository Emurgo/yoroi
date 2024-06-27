import tinycolor from 'tinycolor2'
import MersenneTwister from 'mersenne-twister'

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

export class Jazzicon {
  readonly seed: string
  readonly shapeCount: number
  readonly wobble: number
  readonly colors: ReadonlyArray<string>
  readonly #generator: MersenneTwister
  #shiftedColors: string[] = []

  constructor({
    seed,
    shapeCount = initialShapeCount,
    wobble = initialWobble,
    colors = colorScheme,
  }: JazziconOptions) {
    if (shapeCount + 1 > colors.length)
      throw new Error('Insufficient colors, shape count too high.')
    if (!seed.match(/^[0-9a-fA-F]+$/))
      throw new Error('Seed must be a valid hexadecimal string.')
    if (seed.length < 10)
      throw new Error('Seed must be at least 10 characters long.')

    this.seed = seed
    this.shapeCount = shapeCount
    this.wobble = wobble
    this.colors = colors

    this.#generator = new MersenneTwister()
  }

  private nextColor(): string {
    const index = Math.floor(
      this.#generator.random() * this.#shiftedColors.length,
    )
    return this.#shiftedColors.splice(index, 1)[0]!
  }

  private nextTransform(index: number): string {
    const angle = 2 * Math.PI * this.#generator.random()
    const velocity =
      (100 * (index + this.#generator.random())) / this.shapeCount
    const x = Math.cos(angle) * velocity
    const y = Math.sin(angle) * velocity
    const rotation =
      this.#generator.random() * 360 + this.#generator.random() * 180
    return `translate(${x.toFixed(3)} ${y.toFixed(
      3,
    )}) rotate(${rotation.toFixed(1)} 50 50)`
  }

  public asBase64({size}: {size: number} = {size: initialSize}): string {
    const seedSlice = parseInt(this.seed.slice(2, 10), 16)
    this.#generator.init_seed(seedSlice)
    const position = this.#generator.random()
    const hueShift = 30 * position - this.wobble / 2
    this.#shiftedColors = this.colors.map((hex) =>
      tinycolor(hex).spin(hueShift).toHexString(),
    )

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" x="0" y="0" viewBox="0 0 100 100">`
    svgContent += `<rect x="0" y="0" width="100%" height="100%" fill="${this.nextColor()}" />`

    for (let i = 0; i < this.shapeCount; i++) {
      svgContent += `<rect x="0" y="0" width="100%" height="100%" transform="${this.nextTransform(
        i,
      )}" fill="${this.nextColor()}" />`
    }

    svgContent += '</svg>'

    const base64String = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64String}`
  }
}
