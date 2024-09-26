import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Table = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 22C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5ZM4 5C4 4.44772 4.44772 4 5 4H11V8H4V5ZM11 10H4V14H11V10ZM13 14V10H20V14H13ZM11 16H4V19C4 19.5523 4.44772 20 5 20H11V16ZM13 20V16H20V19C20 19.5523 19.5523 20 19 20H13ZM13 4H19C19.5523 4 20 4.44772 20 5V8H13V4Z"
      fill={color}
    />
  </Svg>
)
