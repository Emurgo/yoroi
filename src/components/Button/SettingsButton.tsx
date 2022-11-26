import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../Icon'

export const SettingsButton = (props) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Gear size={32} color="white" />
    </TouchableOpacity>
  )
}
