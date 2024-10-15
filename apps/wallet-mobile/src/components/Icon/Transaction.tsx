import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Transaction = ({size = 24, color = '#242838'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.445 8.168a1 1 0 00-.277 1.387L8.798 12l-1.63 2.445a1 1 0 101.664 1.11l2-3a1 1 0 000-1.11l-2-3a1 1 0 00-1.387-.277zM16.832 9.555a1 1 0 00-1.664-1.11l-2 3a1 1 0 000 1.11l2 3a1 1 0 001.664-1.11L15.202 12l1.63-2.445z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm8-10a8 8 0 11-16 0 8 8 0 0116 0z"
      fill={color}
    />
  </Svg>
)
