import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Airdrop = ({size = 20, color = '#6B7384'}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M19 9.64C19 7.34853 18.0518 5.15091 16.364 3.5306C14.6761 1.91028 12.3869 1 10 1M19 9.64H1M19 9.64L10 16.12M10 1C7.61305 1 5.32387 1.91028 3.63604 3.5306C1.94821 5.15091 1 7.34853 1 9.64M10 1C10 1 6.25 3.16 6.25 9.64L10 16.12M10 1C10 1 13.75 3.16 13.75 9.64L10 16.12M1 9.64L10 16.12M10 16.12V19M8.5 19H11.5"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
