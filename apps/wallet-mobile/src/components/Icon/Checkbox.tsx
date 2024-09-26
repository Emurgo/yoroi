import * as React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

import {IconProps} from './type'

export const Checkbox = ({size = 16, color = '#4B6DDE'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_24683_1099)">
        <Rect width={size} height={size} rx={2} fill={color} />

        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.857 11L4 8.12l.806-.811L6.857 9.37 11.194 5l.806.818L6.857 11z"
          fill="#fff"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_24683_1099">
          <Rect width={size} height={size} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
