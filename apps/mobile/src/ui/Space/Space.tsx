import {atoms as a, SpacingSize, tokens} from '@yoroi/theme'

import * as React from 'react'
import {View, ViewStyle} from 'react-native'

type SpaceSize = SpacingSize | number

type BaseProps = {
  fill?: boolean
  style?: ViewStyle
  debug?: boolean
}

type HeightProps = BaseProps & {
  size: SpaceSize
}

type WidthProps = BaseProps & {
  size: SpaceSize
}

const getSizeValue = (size: SpaceSize): number => {
  return typeof size === 'number' ? size : tokens.space[size]
}

export const SpaceHeight = ({size, fill, style, debug}: HeightProps) => (
  <View
    style={[
      fill && {...a.flex_1, minHeight: getSizeValue(size)},
      !fill && {height: getSizeValue(size)},
      style,
      debug && a.debug,
    ]}
  />
)

export const SpaceWidth = ({size, fill, style, debug}: WidthProps) => (
  <View
    style={[
      fill && {...a.flex_1, minWidth: getSizeValue(size)},
      !fill && {width: getSizeValue(size)},
      style,
      debug && a.debug,
    ]}
  />
)

export const Space = {
  Height: {
    _2xs: (props: BaseProps) => <SpaceHeight {...props} size="_2xs" />,
    xs: (props: BaseProps) => <SpaceHeight {...props} size="xs" />,
    sm: (props: BaseProps) => <SpaceHeight {...props} size="sm" />,
    md: (props: BaseProps) => <SpaceHeight {...props} size="md" />,
    lg: (props: BaseProps) => <SpaceHeight {...props} size="lg" />,
    xl: (props: BaseProps) => <SpaceHeight {...props} size="xl" />,
    _2xl: (props: BaseProps) => <SpaceHeight {...props} size="_2xl" />,
  },
  Width: {
    _2xs: (props: BaseProps) => <SpaceWidth {...props} size="_2xs" />,
    xs: (props: BaseProps) => <SpaceWidth {...props} size="xs" />,
    sm: (props: BaseProps) => <SpaceWidth {...props} size="sm" />,
    md: (props: BaseProps) => <SpaceWidth {...props} size="md" />,
    lg: (props: BaseProps) => <SpaceWidth {...props} size="lg" />,
    xl: (props: BaseProps) => <SpaceWidth {...props} size="xl" />,
    _2xl: (props: BaseProps) => <SpaceWidth {...props} size="_2xl" />,
  },
}
