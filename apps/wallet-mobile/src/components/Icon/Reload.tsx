import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Reload = ({size = 24, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7.555 5.348A8 8 0 0112 4c2.251 0 4.412.892 6.04 2.454l.546.546H16a1 1 0 100 2h5a.997.997 0 001-1V3a1 1 0 10-2 0v2.586l-.553-.553-.014-.014C17.443 3.105 14.786 2 12 2a10 10 0 1010 10 1 1 0 10-2 0A8 8 0 117.555 5.348z"
      fill={color}
    />
  </Svg>
)
