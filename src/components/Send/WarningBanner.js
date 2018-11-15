import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import Text from '../UiKit/Text'

import style from './styles/WarningBanner.style'

type Props = {
  text: string,
  action: () => void,
}

const WarningBanner = ({text, action}: Props) => (
  <View style={style.container}>
    <View style={style.iconContainer}>
      <Text>!</Text>
    </View>
    <Text style={style.text}>{text}</Text>
    <View style={style.actionContainer}>
      {action && (
        <TouchableHighlight onPress={action}>
          <Text>RI</Text>
        </TouchableHighlight>
      )}
    </View>
  </View>
)

export default WarningBanner
