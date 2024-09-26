import React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

import {IconProps} from './type'

export const Refresh = ({size = 24, color = '#242838', active = false}: IconProps & {active: boolean}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <G clipPath="url(#clip0_1396_4310)">
      <Rect
        x={32}
        y={32}
        width={32}
        height={32}
        rx={16}
        transform="rotate(180 32 32)"
        fill={active ? '#EAEDF2' : 'none'}
      />

      <Path
        d="M7 25a1 1 0 102 0v-3.195l.997.899.003.002a8.996 8.996 0 0013.549-1.809A9.013 9.013 0 0025 16.001a1 1 0 10-2-.002 7.013 7.013 0 01-4.145 6.392 6.993 6.993 0 01-7.52-1.174l-.001-.001L9.984 20H14a1 1 0 100-2H8a1 1 0 00-1 1v6zM25 13a1 1 0 01-1 1h-6a1 1 0 110-2h4.016l-1.35-1.216A6.997 6.997 0 009 16a1 1 0 11-2-.002 9.013 9.013 0 015.33-8.216A8.993 8.993 0 0122 9.294l.003.002.997.899V7a1 1 0 112 0v6z"
        fill={color}
      />
    </G>

    <Defs>
      <ClipPath id="clip0_1396_4310">
        <Rect x={32} y={32} width={32} height={32} rx={16} transform="rotate(180 32 32)" fill="#fff" />
      </ClipPath>
    </Defs>
  </Svg>
)
