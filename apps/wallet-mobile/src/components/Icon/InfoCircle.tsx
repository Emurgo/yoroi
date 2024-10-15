import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const InfoCircle = ({size = 16, color = '#4B6DDE'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      d="M8 4.665A.667.667 0 0 0 8 6h.007a.667.667 0 0 0 0-1.334zm0 2a.667.667 0 0 0-.667.667v3.333a.667.667 0 0 0 1.334 0V7.332A.667.667 0 0 0 8 6.665"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.333 7.999a6.667 6.667 0 1 1 13.334 0 6.667 6.667 0 0 1-13.334 0M8 2.665a5.333 5.333 0 1 0 0 10.667A5.333 5.333 0 0 0 8 2.665"
      fill={color}
    />
  </Svg>
)
