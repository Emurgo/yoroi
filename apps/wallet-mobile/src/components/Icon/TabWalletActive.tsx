import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const TabWalletActive = ({size = 24, color = '#6B7384'}: IconProps) => {
  return (
    <Svg width={size} height={size - 1} viewBox="0 0 25 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.875 17a1 1 0 001-1v-4a1 1 0 00-1-1V7a1 1 0 00-1-1h-.889V3a1 1 0 00-1-1H5.764c-.785 0-1.526.33-2.063.9A3.061 3.061 0 002.875 5v14c0 .778.291 1.534.826 2.1.537.57 1.278.9 2.063.9h15.111a1 1 0 001-1v-4zM5.764 4a.838.838 0 00-.609.272c-.173.184-.28.445-.28.728s.107.544.28.728A.838.838 0 005.764 6h12.222V4H5.764zm15.111 9h-2.333c-.112 0-.266.052-.41.226-.15.18-.257.456-.257.774s.107.595.256.774c.145.174.299.226.41.226h2.334v-2z"
        fill={color}
      />
    </Svg>
  )
}
