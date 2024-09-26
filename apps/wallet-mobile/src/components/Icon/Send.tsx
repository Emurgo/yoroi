import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Send = ({size = 24, color = '#6B7384'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 25 24">
    <Path
      d="M7.793 11.293l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13.5 10.414V16a1 1 0 11-2 0v-5.586l-2.293 2.293a1 1 0 01-1.414-1.414z"
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
