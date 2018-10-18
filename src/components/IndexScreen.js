// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'

import {Text} from './UiKit'
import {COLORS} from '../styles/config'
import {MAIN_ROUTES, ROOT_ROUTES, WALLET_INIT_ROUTES} from '../RoutesList'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const routes = [
  {label: 'Language Picker', path: ROOT_ROUTES.INIT},
  {label: 'Create/Restore switch', path: WALLET_INIT_ROUTES.INIT},
  {label: 'Create Wallet Form', path: WALLET_INIT_ROUTES.CREATE_WALLET},
  {label: 'Recovery Phrase explanation', path: WALLET_INIT_ROUTES.RECOVERY_PHRASE},
  {label: 'Recovery Phrase write down', path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG},
  {label: 'Recovery Phrase confirmation', path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION},
  {label: 'Recovery Phrase dialog', path: WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG},
  {label: 'Restore Wallet form', path: WALLET_INIT_ROUTES.RESTORE_WALLET},
  {label: 'Receive', path: MAIN_ROUTES.RECEIVE},
  {label: 'Send', path: MAIN_ROUTES.SEND},
  {label: 'Tx History', path: MAIN_ROUTES.TX_HISTORY},
  {label: 'Login', path: ROOT_ROUTES.LOGIN},
]

const styles = {
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indexNavigationButtonsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sendButton: {
    textAlign: 'center',
    padding: 5,
  },
}

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
}

const IndexScreen = ({navigation}: Props) => (
  <View style={styles.indexNavigationButtonsContainer}>
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
  </View>
)

export default IndexScreen
