import React from 'react'
import {Text, View} from 'react-native'
import style from './SendScreen.style'

const SendScreen = () => (
  <View
    style={style.container}
  >
    <Text
      style={style.welcome}
    >Send all your ADA here
    </Text>
  </View>
)

export default SendScreen


