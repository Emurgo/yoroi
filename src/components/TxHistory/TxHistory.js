import React from 'react'
import {Text, View} from 'react-native'
import style from './TxHistory.style'

const TxHistory = () => (
  <View
    style={style.container}
  >
    <Text
      style={style.welcome}
    >All your transaction history will be here
    </Text>
  </View>
)

export default TxHistory

