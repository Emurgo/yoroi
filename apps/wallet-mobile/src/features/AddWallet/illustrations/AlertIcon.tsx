import * as React from 'react'
import Svg, {Path, Rect, SvgProps} from 'react-native-svg'

const AlertIcon = (props: SvgProps) => {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none" {...props}>
      <Rect width={17} height={17} rx={8.5} fill="#FF1351" />

      <Path
        d="M9.208 4.958a.708.708 0 10-1.417 0v4.959a.708.708 0 101.417 0V4.958zM8.5 11.333a.708.708 0 000 1.417h.006a.708.708 0 100-1.417H8.5z"
        fill="#fff"
      />
    </Svg>
  )
}

export default AlertIcon
