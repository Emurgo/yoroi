import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

export const Info = ({size = 24, color = '#000'}: {size?: number; color?: string}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 7a1 1 0 100 2h.01a1 1 0 100-2H12zM12 10a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1z" fill={color} />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm10-8a8 8 0 100 16 8 8 0 000-16z"
        fill={color}
      />
    </Svg>
  )
}
