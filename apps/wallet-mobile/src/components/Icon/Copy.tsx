import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Copy = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M4 17C4 17.5523 3.55228 18 3 18C2.44772 18 2 17.5523 2 17V4.6C2 3.87477 2.35255 3.23324 2.79289 2.79289C3.23324 2.35255 3.87477 2 4.6 2H14C14.5523 2 15 2.44771 15 3C15 3.55229 14.5523 4 14 4H4.6C4.52523 4 4.36676 4.04745 4.20711 4.20711C4.04745 4.36676 4 4.52523 4 4.6V17Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 8.00001C6 6.89544 6.89543 6.00001 8 6.00001H19C20.1046 6.00001 21 6.89544 21 8.00001V20C21 21.1046 20.1046 22 19 22H8C6.89543 22 6 21.1046 6 20V8.00001ZM8 8.00001H19V20H8V8.00001Z"
      fill={color}
    />
  </Svg>
)
