import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

export const Chevron = ({
  direction,
  color,
  size = 40,
}: {
  size?: number
  backgroundColor?: string
  color?: string
  direction: 'left' | 'right' | 'up' | 'down'
}) => {
  const {theme} = useTheme()
  const rotate = direction === 'down' ? 0 : direction === 'right' ? 270 : direction === 'left' ? 90 : 180

  return (
    <Svg width={size} height={size} viewBox="-7 -14 28 28" style={{transform: [{rotate: `${rotate}deg`}]}}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683417 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
        fill={color ?? theme.color.gray.max}
      />
    </Svg>
  )
}
