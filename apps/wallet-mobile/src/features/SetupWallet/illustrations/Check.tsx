import * as React from 'react'
import Svg, {Path, Rect, SvgProps} from 'react-native-svg'

export const CheckIllustration = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect width={24} height={24} rx={12} fill="#A0B3F2" />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.7 8.287a1 1 0 01.013 1.414l-6.875 7a1 1 0 01-1.426 0l-3.125-3.182a1 1 0 011.426-1.402l2.412 2.456 6.162-6.274a1 1 0 011.414-.012z"
        fill="#fff"
      />
    </Svg>
  )
}
