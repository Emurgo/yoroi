import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Assets = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 15.8607 5.1403 19 9 19C12.8597 19 16 15.8607 16 12C16 8.1403 12.8597 5 9 5C5.1403 5 2 8.1403 2 12ZM3.93906 12C3.93906 9.2097 6.2097 6.93906 9 6.93906C11.7903 6.93906 14.0609 9.2097 14.0609 12C14.0609 14.7913 11.7903 17.0609 9 17.0609C6.2097 17.0609 3.93906 14.7913 3.93906 12Z"
      fill={color}
    />

    <Path
      d="M15 17C17.7614 17 20 14.7614 20 12C20 9.23858 17.7614 7 15 7V5C18.866 5 22 8.13401 22 12C22 15.866 18.866 19 15 19V17Z"
      fill={color}
    />
  </Svg>
)
