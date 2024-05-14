import React from 'react'
import RNBootSplash from 'react-native-bootsplash'
import {Text, View} from 'react-native'

export const YoroiApp = () => {
  React.useEffect(() => {
    RNBootSplash.hide({fade: true})
  }, [])

  return (
    <View>
      <Text>Text element is showing</Text>
    </View>
  )
}
