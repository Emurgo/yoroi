import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  color?: string
  size?: number
}

export const SupportIllustration = ({color = '#4B6DDE', size = 20}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.343 4.843A8 8 0 0118 10.5v1h-2a3 3 0 00-3 3v3a3 3 0 003 3h1a3 3 0 003-3v-7a10 10 0 00-20 0v7a3 3 0 003 3h1a3 3 0 003-3v-3a3 3 0 00-3-3H2v-1a8 8 0 012.343-5.657zM2 13.5v4a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1H2zm16 0h-2a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1v-4z"
        fill={color}
      />
    </Svg>
  )
}
