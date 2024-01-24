import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Resync = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 3a1 1 0 10-2 0v3.194l-.997-.898L18 5.294a8.997 8.997 0 00-15 6.705 1 1 0 102 .002 7.013 7.013 0 014.145-6.392 6.993 6.993 0 017.52 1.174l.001.001L18.016 8H14a1 1 0 100 2h6a1 1 0 001-1V3zM3 15a1 1 0 011-1h6a1 1 0 110 2H5.984l1.35 1.216A6.997 6.997 0 0019 12a1 1 0 112 .002 9.013 9.013 0 01-5.33 8.216A8.993 8.993 0 016 18.706l-.003-.002L5 17.805V21a1 1 0 11-2 0v-6z"
      fill={color}
    />
  </Svg>
)
