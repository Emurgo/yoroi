import React from 'react'
import Svg, {Circle, G, Line, Path, Rect} from 'react-native-svg'

type Props = {
  width?: number
  height?: number
  color?: string
}

export const StakingKeyDeregistered = ({width = 36, height = 36, color = '#6B7384'}: Props) => (
  <Svg viewBox="0 0 36 36" {...{width, height}}>
    <G stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <G transform="translate(-760.000000, -305.000000)">
        <G transform="translate(760.000000, 305.000000)">
          <G transform="translate(6.000000, 6.000000)">
            <Rect x="0" y="0" width="24" height="24" />
            <G transform="translate(5.000000, 5.000000)" stroke={color} stroke-width="1.5">
              <Circle cx="9.70588235" cy="9.70588235" r="5.29411765" />
              <Line
                x1="6.17647059"
                y1="13.2352941"
                x2="13.0395658"
                y2="6.37219889"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <Path
                d="M9.70588235,0 L0,0 L0,14.1176471 C1.76470588,14.1176471 2.64705882,14.1176471 2.64705882,14.1176471"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </G>
          </G>
        </G>
      </G>
    </G>
  </Svg>
)
