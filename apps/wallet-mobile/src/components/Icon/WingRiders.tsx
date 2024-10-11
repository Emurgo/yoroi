import {useTheme} from '@yoroi/theme'
import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const WingRiders = ({size = 36}: IconProps) => {
  const {color} = useTheme()

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 48 48">
      <Path
        d="M24.115.001a23.83 23.83 0 0116.89 7.03A24.059 24.059 0 0148 24c0 13.186-10.728 24-23.885 24a23.784 23.784 0 01-9.21-1.76 23.875 23.875 0 01-7.828-5.187 24.007 24.007 0 01-5.237-7.814 24.1 24.1 0 010-18.476 24.007 24.007 0 015.237-7.814 23.876 23.876 0 017.827-5.187 23.785 23.785 0 019.21-1.76zm0 46.982c4.524 0 8.947-1.348 12.708-3.874a22.96 22.96 0 008.425-10.315 23.086 23.086 0 001.301-13.28 23.018 23.018 0 00-6.26-11.768 22.84 22.84 0 00-11.713-6.29 22.772 22.772 0 00-13.216 1.31A22.898 22.898 0 005.095 11.23 23.063 23.063 0 001.241 24a23.03 23.03 0 001.727 8.804 22.946 22.946 0 004.957 7.465 22.821 22.821 0 007.428 4.982 22.732 22.732 0 008.762 1.737v-.006zM9.238 19.464H7.112l.27 9.052h2.057l-.201-9.052zm1.247 9.052l.034 2.034c.068 4.437 3.272 8.746 5.837 10.405v-4.88l-3.038-3.73V18.55l5.458 6.507 5.33-6.507 5.33 6.507L34.9 18.55v13.755l-3.07 3.772v4.88c2.564-1.626 5.803-5.965 5.87-10.405l.034-2.034.237-9.052v-.102c0-7.66-6.242-13.533-13.866-13.533S10.24 11.695 10.24 19.364v.102l.245 9.05zm3.88-1.629l4.385 5.12 5.365-6.304 5.363 6.305 4.387-5.085v5.05l-3.071 3.77.033 3.153c-1.619 1.527-3.575 2.849-5.465 2.849h-2.497c-1.888 0-3.81-1.331-5.431-2.849l-.033-3.185-3.04-3.763.004-5.06zm5.566 9.052a3.37 3.37 0 011.247-.306c.98 0 1.486.543 2.937.543 1.45 0 1.956-.543 2.901-.543.434.02.86.125 1.254.308l.371-1.016a5.109 5.109 0 00-1.618-.373c-1.385 0-1.89.542-2.902.542-1.01 0-1.545-.542-2.936-.542a5.32 5.32 0 00-1.618.373l.364 1.014zm7.085 2.068l-.236-1.085a12.843 12.843 0 01-5.33 0l-.236 1.085c1.916.372 3.886.372 5.802 0zm13.84-9.491l.27-9.052h-2.125l-.204 9.052h2.058z"
        fill={color.gray_max}
      />
    </Svg>
  )
}
