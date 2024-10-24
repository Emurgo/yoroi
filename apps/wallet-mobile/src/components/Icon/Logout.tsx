import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Logout = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4a1 1 0 00-1 1v14a1 1 0 001 1h4a1 1 0 110 2H5a3 3 0 01-3-3V5a3 3 0 013-3h4a1 1 0 010 2H5z"
      fill={color}
    />

    <Path
      d="M15.293 6.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L18.586 13H9a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
      fill={color}
    />
  </Svg>
)
