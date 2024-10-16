import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Telegram = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M20.65 4.1052L2.93388 10.6219C1.72482 11.0851 1.73182 11.7285 2.71205 12.0154L7.2605 13.3689L17.7843 7.03519C18.2819 6.74638 18.7365 6.90175 18.3628 7.21819L9.83648 14.5584H9.83448L9.83648 14.5594L9.52273 19.0315C9.98237 19.0315 10.1852 18.8304 10.443 18.5931L12.6523 16.5438L17.2477 19.7817C18.095 20.2268 18.7036 19.998 18.9144 19.0334L21.931 5.47202C22.2398 4.29107 21.4584 3.75635 20.65 4.1052Z"
      fill={color}
    />
  </Svg>
)
