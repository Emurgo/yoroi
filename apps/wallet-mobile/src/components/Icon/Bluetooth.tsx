import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Bluetooth = ({color = '#4B6DDE', size = 25}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.093 2.087a1 1 0 011.076.17l5 4.5a1 1 0 010 1.486L13.995 12l4.174 3.757a1 1 0 010 1.486l-5 4.5A1 1 0 0111.5 21v-6.755l-3.331 2.998a1 1 0 11-1.338-1.486L11.005 12 6.831 8.243a1 1 0 011.338-1.486L11.5 9.755V3a1 1 0 01.593-.913zM13.5 14.245l2.505 2.255-2.505 2.255v-4.51zm0-4.49v-4.51L16.005 7.5 13.5 9.755z"
        fill={color}
      />
    </Svg>
  )
}
