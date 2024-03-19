import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const Info = (props: SvgProps) => {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path d="M10 5a1 1 0 100 2h.01a1 1 0 100-2H10zM10 8a1 1 0 00-1 1v5a1 1 0 102 0V9a1 1 0 00-1-1z" fill="#000" />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10zm10-8a8 8 0 100 16 8 8 0 000-16z"
        fill="#000"
      />
    </Svg>
  )
}
