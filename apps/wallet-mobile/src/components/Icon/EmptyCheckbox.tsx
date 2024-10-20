import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

import {IconProps} from './type'

export const EmptyCheckbox = ({size = 16, color: defaultColor}: IconProps) => {
  const {color} = useTheme()

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_24683_486)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"
          fill={defaultColor ?? color.gray_900}
        />
      </G>

      <Defs>
        <ClipPath id="clip0_24683_486">
          <Rect width={size} height={size} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
