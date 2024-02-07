import * as React from 'react'
import {StyleProp, ViewStyle} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../Icon'

type Props = {
  style: StyleProp<ViewStyle>
  onPress: () => void
}

export const SettingsButton = (props: Props) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Gear size={32} color="white" />
    </TouchableOpacity>
  )
}
