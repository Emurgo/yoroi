import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Swap = ({size = 24, color}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
    <Path
      d="M16.793 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L18.5 5.414V15a1 1 0 11-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414l4-4zM8.5 9a1 1 0 00-2 0v9.586l-2.293-2.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L8.5 18.586V9z"
      fill={color}
    />
  </Svg>
)
