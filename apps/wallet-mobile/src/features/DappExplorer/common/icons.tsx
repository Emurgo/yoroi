import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

export const NavigationArrowRightIcon = ({color = '#000000'}) => {
  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none">
      <Path
        d="M13.04 4.293a1 1 0 10-1.414 1.414L16.92 11H5.334a1 1 0 100 2h11.585l-5.293 5.293a1 1 0 001.415 1.414l7-7a1 1 0 000-1.414l-7-7z"
        fill={color}
      />
    </Svg>
  )
}

export const NavigationArrowLeftIcon = ({color = '#000000'}) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.707 5.707a1 1 0 00-1.414-1.414l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414-1.414L7.414 13H19a1 1 0 100-2H7.414l5.293-5.293z"
        fill={color}
      />
    </Svg>
  )
}

export const NavigationShareIcon = ({color = '#000000'}) => {
  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none">
      <Path
        d="M11.96 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.415 1.414l-2.293-2.293V16a1 1 0 11-2 0V5.414L9.374 7.707a1 1 0 01-1.415-1.414l4-4z"
        fill={color}
      />
      <Path
        d="M4.667 11a1 1 0 011 1v7.2c0 .176.076.37.254.53.182.163.448.27.745.27h12c.298 0 .564-.107.746-.27a.715.715 0 00.255-.53V12a1 1 0 112 0v7.2c0 .779-.345 1.501-.917 2.016a3.118 3.118 0 01-2.084.784h-12a3.118 3.118 0 01-2.083-.784 2.713 2.713 0 01-.917-2.016V12a1 1 0 011-1z"
        fill={color}
      />
    </Svg>
  )
}

export const NavigationRefreshIcon = ({color = '#000000'}) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.555 5.348A8 8 0 0112 4c2.251 0 4.412.892 6.04 2.454l.546.546H16a1 1 0 100 2h5a.997.997 0 001-1V3a1 1 0 10-2 0v2.586l-.553-.553-.014-.014C17.443 3.105 14.786 2 12 2a10 10 0 1010 10 1 1 0 10-2 0A8 8 0 117.555 5.348z"
        fill={color}
      />
    </Svg>
  )
}
