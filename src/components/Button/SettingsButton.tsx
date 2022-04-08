import * as React from 'react'
import {Image} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import gear from '../../assets//img/gear.png'

export const SettingsButton = (props) => {
  return (
    <TouchableOpacity {...props}>
      <Image source={gear} />
    </TouchableOpacity>
  )
}
