import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const CheckIllustration = (props: SvgProps) => {
  return (
    <Svg width={12} height={9} viewBox="0 0 12 9" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7.287a1 1 0 01.013 1.414l-6.875 7a1 1 0 01-1.426 0L.287 5.519a1 1 0 011.426-1.402l2.412 2.456L10.287.299A1 1 0 0111.7.287z"
        fill="#fff"
      />
    </Svg>
  )
}
