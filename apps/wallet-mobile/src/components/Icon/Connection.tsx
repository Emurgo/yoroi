import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Connection = ({size = 36, color = '#000000'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 20" fill="none">
      <Path
        d="M16.207.293a1 1 0 10-1.414 1.414L17.086 4H7.5a1 1 0 000 2h9.586l-2.293 2.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4zM6.207 10.293a1 1 0 010 1.414L3.914 14H13.5a1 1 0 110 2H3.914l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        fill={color}
      />
    </Svg>
  )
}
