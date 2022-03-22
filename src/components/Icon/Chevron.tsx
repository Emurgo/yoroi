import * as React from 'react'
import Svg, {G, Path, Rect} from 'react-native-svg'

export const Chevron = ({
  direction,
  color = 'black',
  backgroundColor = 'transparent',
  size = 40,
}: {
  size?: number
  color?: string
  backgroundColor?: string
  direction: 'left' | 'right' | 'up' | 'down'
}) => {
  const rotate = direction === 'down' ? 270 : direction === 'right' ? 180 : direction === 'left' ? 0 : 90

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" style={{transform: [{rotate: `${rotate}deg`}]}}>
      <Rect fill={backgroundColor} id="Rectangle" x="0" y="0" width="20" height="20" />
      <G translateX={5} translateY={3}>
        <Path
          id="arrow"
          fill={color}
          d="M6.35936674,0.280188397 L0.282524821,6.32037882 C-0.094120172,6.69544642 -0.094120172,7.30455358 0.282196319,7.67929436 L6.35969524,13.7201384 C6.54261657,13.9022941 6.78177602,14 7.03854416,14 C7.2953123,14 7.53447175,13.9022941 7.71772158,13.7198116 L7.79788368,13.629386 C8.09181135,13.2527488 8.06509065,12.7071374 7.71772158,12.3612229 L2.33395895,7 L7.71772158,1.63877712 C8.09403807,1.26403634 8.09403807,0.654929178 7.71772158,0.280188397 C7.34256621,-0.0933961323 6.73452211,-0.0933961323 6.35936674,0.280188397 Z"
        />
      </G>
    </Svg>
  )
}
