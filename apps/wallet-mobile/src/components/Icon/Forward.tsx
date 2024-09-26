import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Forward = ({size = 24, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.707 4.293a1 1 0 10-1.414 1.414L16.586 11H5a1 1 0 100 2h11.586l-5.293 5.293a1 1 0 001.414 1.414l7-7a1 1 0 000-1.414l-7-7z"
      fill={color}
    />
  </Svg>
)
