import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Clock = ({size = 40, color}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8V13C11 13.5523 11.4477 14 12 14H16C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12H13V8Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"
      fill={color}
    />
  </Svg>
)
