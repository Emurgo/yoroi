import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const MultiParty = ({size = 40, color = '#242838', ...props}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 15a1 1 0 011 1v4a1 1 0 01-1 1h-3v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1h3v-3a1 1 0 011-1h4zm-1 2v2h-2v-2h2zm-4 4v2h-2v-2h2z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 20c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm-10 8a8 8 0 100-16 8 8 0 000 16z"
        fill={color}
      />
    </Svg>
  )
}
