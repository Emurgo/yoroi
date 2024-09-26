import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Square = ({size = 24, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H5zM2 5a3 3 0 013-3h14a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V5z"
      fill={color}
    />
  </Svg>
)
