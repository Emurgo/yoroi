// @flow

import React from 'react'
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'

import {Text, Button} from './UiKit'
import {WALLET_ROUTES, ROOT_ROUTES, WALLET_INIT_ROUTES} from '../RoutesList'
import storage from '../utils/storage'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const routes = [
  {label: 'Language Picker', path: ROOT_ROUTES.INIT},
  {label: 'Create/Restore switch', path: WALLET_INIT_ROUTES.INIT},
  {label: 'Wallet list', path: ROOT_ROUTES.WALLET_SELECTION},
  {label: 'Login', path: ROOT_ROUTES.LOGIN},
  {label: 'Settings', path: WALLET_ROUTES.SETTINGS},
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

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
}

const IndexScreen = ({navigation}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
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
    </ScrollView>
  </SafeAreaView>
)

export default IndexScreen
