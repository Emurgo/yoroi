import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Time = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 8a1 1 0 10-2 0v5a1 1 0 001 1h4a1 1 0 100-2h-3V8z"
      fill={color}
    />

    <Path
      d="M13 8a1 1 0 10-2 0v5a1 1 0 001 1h4a1 1 0 100-2h-3V8z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4 12a8 8 0 1116 0 8 8 0 01-16 0z"
      fill={color}
    />
  </Svg>
)
