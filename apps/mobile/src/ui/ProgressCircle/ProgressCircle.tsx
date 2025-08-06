import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {Text} from '~/ui/Text/Text'

type ExternalProps = {
  percentage: number
}

export const ProgressCircle = ({percentage}: ExternalProps) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.align_center, a.justify_center, a.relative, {width: 56}]}>
      <Text
        style={[
          a.body_1_lg_medium,
          a.text_center,
          a.absolute,
          {color: p.text_gray_medium},
        ]}
      >
        {percentage}%
      </Text>

      <Svg
        width={56}
        height={56}
        viewBox="0 0 36 36"
        style={[a.absolute, {top: -28, bottom: 0, left: 0, right: 0}]}
      >
        <Path
          fill="none"
          stroke={p.gray_200}
          strokeWidth="4"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        <Path
          fill="none"
          stroke={p.el_primary_medium}
          strokeWidth="4"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </Svg>
    </View>
  )
}
