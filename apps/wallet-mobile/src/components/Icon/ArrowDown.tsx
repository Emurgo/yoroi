import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const ArrowDown = ({size = 17, color = '#000'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 17" fill="none">
      <Path
        fill={color}
        d="M6.793 16.707a1 1 0 001.414 0l6.364-6.364a1 1 0 00-1.414-1.414L8.514 13.615 6.493 13.616 1.843 8.929A1 1 0 00.43 10.343l6.364 6.364zM6.5 0v13.615h2.011V0h-2z"
      />
    </Svg>
  )
}
