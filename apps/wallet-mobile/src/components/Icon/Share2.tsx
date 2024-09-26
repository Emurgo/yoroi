import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Share2 = ({size = 24, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M11.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 5.414V16a1 1 0 11-2 0V5.414L8.707 7.707a1 1 0 01-1.414-1.414l4-4z"
      fill={color}
    />

    <Path
      d="M4 11a1 1 0 011 1v7.2c0 .176.077.37.255.53.181.163.448.27.745.27h12c.297 0 .564-.107.745-.27A.715.715 0 0019 19.2V12a1 1 0 112 0v7.2c0 .779-.345 1.501-.917 2.016A3.118 3.118 0 0118 22H6a3.118 3.118 0 01-2.083-.784A2.713 2.713 0 013 19.2V12a1 1 0 011-1z"
      fill={color}
    />
  </Svg>
)
