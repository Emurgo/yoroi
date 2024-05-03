import React from 'react'
import Svg, {Path, Rect, Defs, LinearGradient, Stop} from 'react-native-svg'

type Props = {
  size?: number
}

export const YoroiApp = ({size = 36}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 49 48" fill="none">
      <Rect x={0.5} width={48} height={48} rx={8} fill="url(#paint0_linear_16084_126466)" />
      <Path
        d="M23.702 21.15L10 11h4.304l10.16 7.293L34.674 11H39L25.23 21.15a1.318 1.318 0 01-1.527 0zM29.06 32.771L12.298 20.762v-3.44l19.465 13.834-2.703 1.615zM29.871 25.748l5.948-4.424v-3.3l-8.246 6.039 2.298 1.685zM35.143 29.54l.676-.561v-3.23l-2.974 2.106 2.298 1.686zM12.298 28.205L23.383 36l2.77-1.545-13.855-9.832v3.582z"
        fill="#fff"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_16084_126466"
          x1={50.6518}
          y1={77.0646}
          x2={108.781}
          y2={-23.2391}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#244ABF" />
          <Stop offset={1} stopColor="#4760FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
