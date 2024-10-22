import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Received = ({size = 24, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
    <Path
      d="M12.5 7a1 1 0 011 1v5.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414l2.293 2.293V8a1 1 0 011-1z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 22c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm8-10a8 8 0 11-16 0 8 8 0 0116 0z"
      fill={color}
    />
  </Svg>
)
