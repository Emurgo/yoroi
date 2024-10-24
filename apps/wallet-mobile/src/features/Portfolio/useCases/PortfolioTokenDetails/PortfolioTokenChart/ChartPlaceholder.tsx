import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useWindowDimensions} from 'react-native'
import Svg, {Path} from 'react-native-svg'

export const ChartPlaceholder = () => {
  const {width} = useWindowDimensions()
  const {color} = useTheme()

  return (
    <Svg width={width} height={144} viewBox="0 0 345 114" fill="none">
      <Path
        d="M1 100.743l3.793-3.173c3.793-3.173 11.379-9.519 18.964-14.554 7.586-5.035 15.172-8.759 22.758-4.645 7.585 4.113 15.171 16.064 22.757 24.517 7.586 8.453 15.171 13.407 22.757 7.586 7.586-5.821 15.172-22.418 22.757-44.911 7.586-22.493 15.172-50.883 22.758-60.343 7.586-9.46 15.171.01 22.757-.466 7.586-.475 15.172-10.894 22.757 6.34 7.586 17.235 15.172 62.123 22.758 69.525 7.585 7.401 15.171-22.684 22.757-18.094 7.586 4.59 15.172 43.854 22.757 41.6 7.586-2.254 15.172-46.027 22.758-69.273 7.585-23.245 15.171-25.965 22.757-9.12 7.586 16.845 15.171 53.255 22.757 56.734 7.586 3.48 15.172-25.971 18.965-40.696L344 13.985"
        stroke={color.gray_100}
        strokeWidth={2}
      />
    </Svg>
  )
}
