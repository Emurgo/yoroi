import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Portfolio = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 18" fill="none">
    <Path
      d="M18 4V2C18 0.897 17.103 0 16 0H3C1.346 0 0 1.346 0 3V15C0 17.201 1.794 18 3 18H18C19.103 18 20 17.103 20 16V6C20 4.897 19.103 4 18 4ZM16 13H14V9H16V13ZM3 4C2.74252 3.98848 2.49941 3.87809 2.32128 3.69182C2.14315 3.50554 2.04373 3.25774 2.04373 3C2.04373 2.74226 2.14315 2.49446 2.32128 2.30818C2.49941 2.12191 2.74252 2.01152 3 2H16V4H3Z"
      fill={color}
    />
  </Svg>
)
