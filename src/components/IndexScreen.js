// @flow

import React from 'react'
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  View,
  TouchableHighlight,
} from 'react-native'

import {Text} from './UiKit'
import {COLORS} from '../styles/config'
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
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
  },
  sendButton: {
    padding: 5,
    textAlign: 'center',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
}

const IndexScreen = ({navigation}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <ScrollView style={styles.container}>
      {routes.map((route) => (
        <TouchableHighlight
          key={route.path}
          style={styles.button}
          onPress={() => navigation.navigate(route.path)}
        >
          <View style={styles.sendButton}>
            <Text>{route.label}</Text>
          </View>
        </TouchableHighlight>
      ))}
      <TouchableHighlight onPress={() => storage.clearAll()}>
        <View style={styles.sendButton}>
          <Text>Clear storage</Text>
        </View>
      </TouchableHighlight>
    </ScrollView>
  </SafeAreaView>
)

export default IndexScreen
