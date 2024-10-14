import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const AngleDown = ({size = 16, color = '#CF053A'}: IconProps) => (
  <Svg viewBox="0 0 16 16" width={size} height={size}>
    <Path
      fill={color}
      d="M7.4985 10.7599C7.76411 11.0635 8.23633 11.0635 8.50194 10.7599L11.6994 7.10567C12.0766 6.67461 11.7705 6 11.1977 6H4.80273C4.22996 6 3.92384 6.67461 4.30101 7.10567L7.4985 10.7599Z"
    />
  </Svg>
)
