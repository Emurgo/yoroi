import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'

import {useStrings} from '../../features/SetupWallet/common/useStrings'

export const LearnMoreButton = ({
  activeOpacity = 0.5,
  ...props
}: TouchableOpacityProps) => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <TouchableOpacity activeOpacity={activeOpacity} {...props}>
      <Text
        style={[
          styles.text,
          {color: color.primary_500},
          {textDecorationLine: 'none'},
        ]}
      >
        {strings.learnMore}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  text: {
    ...a.link_1_lg_underline,
    alignSelf: 'center',
  },
})
