import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Usb = ({color = '#4B6DDE', size = 25}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Path
        d="M16.5 10h1v2h-4V6h2l-3-4-3 4h2v8h-4v-2.277a1.992 1.992 0 00.414-3.137A2 2 0 004.5 10c0 .738.404 1.376 1 1.723V14c0 1.103.897 2 2 2h4v2.277a1.99 1.99 0 00-.414 3.137A2 2 0 0014.5 20c0-.738-.404-1.376-1-1.723V14h4c1.103 0 2-.897 2-2v-2h1V6h-4v4z"
        fill={color}
      />
    </Svg>
  )
}
