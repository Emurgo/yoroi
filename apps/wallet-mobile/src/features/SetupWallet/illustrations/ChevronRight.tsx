import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const ChevronRightGrayIllustration = (props: SvgProps) => {
  return (
    <Svg width={8} height={14} viewBox="0 0 8 14" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.293.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L5.586 7 .293 1.707a1 1 0 010-1.414z"
        fill="#6B7384"
      />
    </Svg>
  )
}

export const ChevronRightDarkIllustration = (props: SvgProps) => {
  return (
    <Svg width={8} height={14} viewBox="0 0 8 14" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.293.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L5.586 7 .293 1.707a1 1 0 010-1.414z"
        fill="#000000"
      />
    </Svg>
  )
}
