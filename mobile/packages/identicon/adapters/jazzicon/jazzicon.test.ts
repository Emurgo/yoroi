import {Jazzicon} from './jazzicon'

describe('Jazzicon', () => {
  const icon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB4PSIwIiB5PSIwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZjMTkzOCIgLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMi43ODMgNS45NzgpIHJvdGF0ZSgxMTkuNCA1MCA1MCkiIGZpbGw9IiNjNzE0MmQiIC8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI4Ljg4MiAyNS44OTEpIHJvdGF0ZSgxNzguMCA1MCA1MCkiIGZpbGw9IiMyNDQ0ZTEiIC8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTQ3LjEwMSA4MC40MDApIHJvdGF0ZSg0NzAuMiA1MCA1MCkiIGZpbGw9IiMwMzNmNWQiIC8+PC9zdmc+'

  it('should generate a unique identicon SVG for a given seed', () => {
    const seed = 'abcdef1234567890'
    const jazz = new Jazzicon({seed})
    const svg = jazz.asBase64({size: 100})

    expect(svg).toBe(icon)

    const svg2 = jazz.asBase64()
    expect(svg2).toBe(icon)
  })

  it('should throw an error if the seed is invalid', () => {
    const invalidSeed = 'invalidseed'

    expect(() => new Jazzicon({seed: invalidSeed})).toThrow(
      'Seed must be a valid hexadecimal string.',
    )
  })

  it('should throw an error if there are insufficient base colors', () => {
    const invalidShapeCount = 10

    expect(
      () =>
        new Jazzicon({seed: 'abcdef1234567890', shapeCount: invalidShapeCount}),
    ).toThrow('Insufficient colors, shape count too high.')
  })

  it('should throw an error if the seed is too short', () => {
    const shortSeed = 'abc'

    expect(() => new Jazzicon({seed: shortSeed})).toThrow(
      'Seed must be at least 10 characters long.',
    )
  })
})
