declare module 'mersenne-twister' {
  export default class MersenneTwister {
    constructor(seed?: number)
    init_seed(seed: number): void
    random(): number
  }
}
