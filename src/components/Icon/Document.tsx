import React from 'react'
import Svg, {G, Line, Rect} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  backgroundColor?: string
}

export const Document = ({size = 40, color = 'black', backgroundColor = 'transparent'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G transform={{scale: 1.25, translateX: -3, translateY: -3}}>
      <Rect
        id="document"
        stroke={color}
        strokeWidth="1.3"
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        fill={backgroundColor}
      />
      <G id="lines" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="8" y1="10" x2="11" y2="10" />
        <Line x1="8" y1="13" x2="11" y2="13" />
        <Line x1="8" y1="16" x2="11" y2="16" />
        <Line x1="8" y1="7" x2="11" y2="7" />
        <Line x1="13" y1="10" x2="16" y2="10" />
        <Line x1="13" y1="13" x2="16" y2="13" />
        <Line x1="13" y1="7" x2="16" y2="7" />
      </G>
    </G>
  </Svg>
)
