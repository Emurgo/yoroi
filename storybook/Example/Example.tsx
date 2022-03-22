import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

export const Example = () => (
  <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{paddingHorizontal: 16}}>
    <Row title="Common Navigation" access={!!useNavigation()} />
    <Row title="Stack Navigation" access={'replace' in useNavigation()} />
    <Row title="Tab Navigation" access={'jumpTo' in useNavigation()} />
    <Row title="Route Params" access={Object.keys(useRoute().params || {}).length > 0} />
  </SafeAreaView>
)

const Row = ({title, access}: {title: string; access: boolean}) => (
  <View style={[styles.row, access ? styles.access : styles.noAccess]}>
    <Text>{title}</Text>
  </View>
)

const styles = StyleSheet.create({
  row: {
    padding: 32,
    borderWidth: 1,
    flexDirection: 'row',
  },
  access: {
    backgroundColor: 'lightgreen',
  },
  noAccess: {
    backgroundColor: 'lightcoral',
  },
})
