import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {useStrings} from '~/features/SetupWallet/common/useStrings'

export const LearnMoreButton = ({
  activeOpacity = 0.5,
  ...props
}: TouchableOpacityProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity activeOpacity={activeOpacity} {...props}>
      <Text
        style={[
          a.link_1_lg_underline,
          {alignSelf: 'center', color: p.primary_500},
        ]}
      >
        {strings.learnMore}
      </Text>
    </TouchableOpacity>
  )
}
