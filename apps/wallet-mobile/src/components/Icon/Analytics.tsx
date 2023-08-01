import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {size: number; color?: string}

export const Analytics = ({size = 24, color}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.065 10.849l-.077-.031a3.019 3.019 0 00-.75-.194l-.825-.1-.158-.018.086-.135 4.925-7.75h0a.826.826 0 01.552-.382.821.821 0 01.665.155s0 0 0 0l-.058.081c.167.117.27.275.313.475a.68.68 0 01-.113.55l-4.56 7.349zm0 0l.044-.07 4.6-7.223-4.644 7.293zM5.912 12.044l2.262 2.646h0l.002.002c.188.207.43.301.718.283a.805.805 0 00.666-.398h0l3.193-5.215 1.038 1.593.045.068.076-.03c.247-.1.495-.186.742-.26.244-.073.497-.126.758-.159l.162-.02-.091-.135-2.075-3.074a.788.788 0 00-.724-.382.785.785 0 00-.695.41l-3.302 5.333-2.236-2.62h0l-.002-.003A.853.853 0 005.73 9.8a.805.805 0 00-.666.397s0 0 0 0L1.29 16.223h0v.002a.885.885 0 00-.114.617.798.798 0 00.34.54c.206.15.431.198.67.141a.872.872 0 00.548-.393v-.001l3.178-5.084zm11.556 8.276a4.276 4.276 0 001.096-.54l2.765 2.74s0 0 0 0a.834.834 0 00.608.255c.236 0 .44-.086.609-.254a.777.777 0 00.241-.6.868.868 0 00-.266-.592l-2.744-2.743c.218-.353.394-.725.53-1.116.145-.419.218-.85.218-1.295 0-1.21-.423-2.24-1.267-3.083-.844-.844-1.874-1.267-3.083-1.267-1.21 0-2.24.423-3.083 1.267-.844.844-1.267 1.874-1.267 3.083 0 1.21.423 2.24 1.267 3.083.844.844 1.873 1.267 3.083 1.267.444 0 .875-.068 1.293-.205zm.586-2.266a2.554 2.554 0 01-1.879.771c-.74 0-1.365-.256-1.88-.77a2.553 2.553 0 01-.77-1.88c0-.74.256-1.365.77-1.88a2.554 2.554 0 011.88-.77c.74 0 1.365.256 1.88.77.514.515.77 1.14.77 1.88s-.256 1.365-.77 1.88z"
        fill={color ?? '#000'}
        stroke="#000"
        strokeWidth={0.2}
      />
    </Svg>
  )
}
