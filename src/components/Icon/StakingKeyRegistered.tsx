import React from 'react'
import Svg, {G, Line, Path, Polyline, Rect} from 'react-native-svg'

type Props = {
  width?: number
  height?: number
  color?: string
}

export const StakingKeyRegistered = ({width = 36, height = 36, color = '#6B7384'}: Props) => (
  <Svg viewBox="0 0 36 36" {...{width, height}}>
    <G stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <G transform="translate(-760.000000, -245.000000)">
        <G transform="translate(760.000000, 245.000000)">
          <G transform="translate(6.000000, 6.000000)">
            <Rect x="0" y="0" width="24" height="24" />
            <G
              transform="translate(5.000000, 5.000000)"
              stroke={color}
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            >
              <Polyline points="5.33333333 8.88888889 11.8790765 2.34314575 15.3777778 5.95555556" />
              <Line x1="8.88888889" y1="12.4444444" x2="15.1742825" y2="6.15905083" />
              <Polyline points="5.33333333 8.88888889 5.33333333 12.4444444 8.88888889 12.4444444" />
              <Path d="M9.77777778,0 L0,0 L0,14.2222222 C1.77777778,14.2222222 2.66666667,14.2222222 2.66666667,14.2222222" />
            </G>
          </G>
        </G>
      </G>
    </G>
  </Svg>
)
