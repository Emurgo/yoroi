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
import {MAIN_ROUTES, ROOT_ROUTES, WALLET_INIT_ROUTES} from '../RoutesList'
import storage from '../utils/storage'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const routes = [
  {label: 'Language Picker', path: ROOT_ROUTES.INIT},
  {label: 'Create/Restore switch', path: WALLET_INIT_ROUTES.INIT},
  {label: 'Create Wallet Form', path: WALLET_INIT_ROUTES.CREATE_WALLET},
  {
    label: 'Recovery Phrase explanation',
    path: WALLET_INIT_ROUTES.RECOVERY_PHRASE,
  },
  {
    label: 'Recovery Phrase write down',
    path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG,
  },
  {
    label: 'Recovery Phrase confirmation',
    path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION,
  },
  {
    label: 'Recovery Phrase dialog',
    path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG,
  },
  {label: 'Restore Wallet form', path: WALLET_INIT_ROUTES.RESTORE_WALLET},
  {label: 'Receive', path: MAIN_ROUTES.RECEIVE},
  {label: 'Send', path: MAIN_ROUTES.SEND},
  {label: 'Tx History', path: MAIN_ROUTES.TX_HISTORY},
  {label: 'Login', path: ROOT_ROUTES.LOGIN},
  {label: 'Settings', path: MAIN_ROUTES.SETTINGS},
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
