import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const YoroiLogo = (props: SvgProps) => {
  return (
    <Svg width={57} height={48} viewBox="0 0 57 48" fill="none" {...props}>
      <Path
        d="M26.96 19.488L.498 0h8.312l19.62 14.003L48.146 0h8.354L29.908 19.488a2.555 2.555 0 01-2.95 0zM37.305 41.801L4.937 18.744v-6.607L42.527 38.7l-5.222 3.101zM38.872 28.317l11.486-8.495v-6.337L34.435 25.08l4.437 3.236zM49.052 35.598l1.305-1.078v-6.203l-5.742 4.045 4.437 3.236zM4.937 33.034L26.342 48l5.351-2.967L4.937 26.157v6.877z"
        fill="#4B6DDE"
      />
    </Svg>
  )
}
