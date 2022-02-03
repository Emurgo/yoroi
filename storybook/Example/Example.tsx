import {useNavigation, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

export const Example = () => {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{paddingHorizontal: 16}}>
      <Row title="Common Navigation" access={!!useNavigation()} />
      <Row title="Stack Navigation" access={'replace' in useNavigation()} />
      <Row title="Tab Navigation" access={'jumpTo' in useNavigation()} />
      <Row title="Route Params" access={Object.keys(useRoute().params || {}).length > 0} />
    </SafeAreaView>
  )
}

export default Example

const Row = ({title, access}: {title: string; access: boolean}) => (
  <View style={{padding: 16, borderWidth: 1, flexDirection: 'row', backgroundColor: access ? 'green' : 'red'}}>
    <View style={{padding: 16, flexDirection: 'row'}}>
      <Text>{title}</Text>
    </View>
  </View>
)
