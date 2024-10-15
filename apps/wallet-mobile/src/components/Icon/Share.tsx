import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Share = ({size = 36, color = '#000000'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 25" fill="none">
      <Path
        d="M11.293 8.793a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 11.914V15.5a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5.3c0-1.643 1.445-2.8 3-2.8h10c1.555 0 3 1.157 3 2.8v14.4c0 1.643-1.445 2.8-3 2.8H7c-1.555 0-3-1.157-3-2.8V5.3zm3-.8c-.654 0-1 .455-1 .8v14.4c0 .345.346.8 1 .8h10c.654 0 1-.455 1-.8V5.3c0-.345-.346-.8-1-.8H7z"
        fill={color}
      />
    </Svg>
  )
}
