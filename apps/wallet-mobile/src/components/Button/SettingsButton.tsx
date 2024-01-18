import * as React from 'react'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../Icon'
import {StyleProp, ViewStyle} from 'react-native'

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
