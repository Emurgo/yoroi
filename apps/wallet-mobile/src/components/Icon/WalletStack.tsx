import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const WalletStack = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path d="M8 2C6.89543 2 6 2.89543 6 4H18C18 2.89543 17.1046 2 16 2H8Z" fill={color} />

    <Path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7H4Z" fill={color} />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 8C3.34315 8 2 9.34315 2 11V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V11C22 9.34315 20.6569 8 19 8H5ZM19 10H5C4.44772 10 4 10.4477 4 11V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V11C20 10.4477 19.5523 10 19 10Z"
      fill={color}
    />
  </Svg>
)
