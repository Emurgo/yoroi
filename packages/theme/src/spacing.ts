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

function getSpacing(
  value: `${Direction}-${SpacingSize}` | 'none',
): Record<string, number> {
  // Check for 'none' case and return padding: 0
  if (value === 'none') {
    return {padding: 0}
  }

  // handle directional and size specific padding
  const [direction, size] = value.split('-') as [Direction, SpacingSize]
  const pixelValue = baseSpace[size] ?? 0

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

export const space = new Proxy<Record<string, () => Record<string, number>>>(
  {},
  {
    get: function (
      _: Record<string, () => Record<string, number>>,
      prop: PropertyKey,
    ): () => Record<string, number> {
      if (typeof prop === 'string') {
        return () => getSpacing(prop as `${Direction}-${SpacingSize}` | 'none')
      }
      return () => ({})
    },
  },
)
