import {Dex} from './types'
import {isDex} from './validators'

describe('isDex', () => {
  const validDexValues: Array<Dex> = [
    'MINSWAP',
    'MINSWAPV2',
    'MUESLISWAP',
    'MUESLISWAPV2',
    'SPLASH',
    'SUNDAESWAP',
    'SUNDAESWAPV3',
    'VYFI',
    'WINGRIDER',
    'WINGRIDERV2',
  ]

  const invalidDexValues = ['INVALID_DEX', 123, null, undefined, {}, []]

  it.each(validDexValues)(
    'should return true for valid Dex value: %s',
    (value) => {
      expect(isDex(value)).toBe(true)
    },
  )

  it.each(invalidDexValues)(
    'should return false for invalid Dex value: %s',
    (value) => {
      expect(isDex(value)).toBe(false)
    },
  )
})
