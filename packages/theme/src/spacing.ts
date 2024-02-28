import {Direction, SpacingSize} from './types'

export const baseSpace: Record<SpacingSize, number> = {
  none: 0,
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
}

function getPadding(
  value: `${Direction}-${SpacingSize}` | SpacingSize | 'none',
): Record<string, number> {
  // Directly return padding: 0 for 'none'
  if (value === 'none') {
    return {padding: 0}
  }

  // Split the value to check if it includes a direction
  const parts = value.split('-')
  let pixelValue

  // Check if a direction is provided
  if (parts.length === 1) {
    const size = parts[0] as SpacingSize
    pixelValue = baseSpace[size] ?? 0
    return {
      padding: pixelValue,
    }
  } else {
    const [direction, size] = parts as [Direction, SpacingSize]
    pixelValue = baseSpace[size] ?? 0

    switch (direction) {
      case 'x':
        return {paddingHorizontal: pixelValue}
      case 'y':
        return {paddingVertical: pixelValue}
      case 't':
        return {paddingTop: pixelValue}
      case 'b':
        return {paddingBottom: pixelValue}
      case 'l':
        return {paddingLeft: pixelValue}
      case 'r':
        return {paddingRight: pixelValue}
      default:
        return {}
    }
  }
}

export const padding = new Proxy<Record<string, Record<string, number>>>(
  {},
  {
    get: function (
      _: Record<string, Record<string, number>>,
      prop: string,
    ): Record<string, number> {
      return getPadding(
        prop as `${Direction}-${SpacingSize}` | SpacingSize | 'none',
      )
    },
  },
)
