// @flow

import React from 'react'
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'

import {Text, Button, StatusBar} from './UiKit'
import {ROOT_ROUTES} from '../RoutesList'
import storage from '../utils/storage'

const routes = [
  {label: 'Storybook', path: ROOT_ROUTES.STORYBOOK},
  {label: 'Skip to wallet list', path: ROOT_ROUTES.WALLET},
  {label: 'Default', path: ROOT_ROUTES.LOGIN},
]

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  link: {
    height: 32,
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
})

// TODO: re-type
type Props = {
  navigation: any, // NavigationScreenProp<NavigationState>,
}

const crash = () => {
  return Promise.reject(new Error('Forced crash'))
}

const IndexScreen = ({navigation}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="light" />

    <ScrollView style={styles.container}>
      {routes.map((route) => (
        <Button
          key={route.path}
          style={styles.button}
          onPress={() => navigation.navigate(route.path)}
          title={route.label}
        />
      ))}
      <TouchableOpacity onPress={() => storage.clearAll()}>
        <Text style={styles.link}>Clear storage</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={crash}>
        <Text style={styles.link}>Crash</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
)

export default IndexScreen
