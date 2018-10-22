// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'

import {Text} from '../UiKit'
import {SETTINGS_ROUTES} from '../../RoutesList'

import styles from './styles/SettingsScreen.style'

type Props = {
  navigateToSupport: () => void,
};

const SettingsScreen = ({navigateToSupport}: Props) => (
  <View style={styles.container}>
    <TouchableHighlight onPress={navigateToSupport}>
      <Text style={styles.linkLabel}>Terms of Use</Text>
    </TouchableHighlight>

    <TouchableHighlight onPress={navigateToSupport}>
      <Text style={styles.linkLabel}>Support</Text>
    </TouchableHighlight>
  </View>
)

export default compose(
  withHandlers({
    navigateToSupport: ({navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.SUPPORT),
  })
)(SettingsScreen)
