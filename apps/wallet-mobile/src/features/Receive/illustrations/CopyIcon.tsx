import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

function CopyIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M4 17a1 1 0 11-2 0V4.6c0-.725.353-1.367.793-1.807C3.233 2.353 3.875 2 4.6 2H14a1 1 0 110 2H4.6c-.075 0-.233.047-.393.207-.16.16-.207.318-.207.393V17z"
        fill="#fff"
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 8a2 2 0 012-2h11a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm2 0h11v12H8V8z"
        fill="#fff"
      />
    </Svg>
  )
}

export default CopyIcon
