// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'

import {Text} from '../UiKit'
import {SETTINGS_ROUTES} from '../../RoutesList'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.settings


type Props = {
  navigateToChangeWalletName: () => void,
  navigateToSupport: () => void,
  translation: SubTranslation<typeof getTranslation>,
};

const SettingsScreen = ({
  navigateToChangeWalletName,
  navigateToSupport,
  translation,
}: Props) => (
  <View style={styles.container}>
    <TouchableHighlight onPress={navigateToChangeWalletName}>
      <Text style={styles.linkLabel}>{translation.editWalletName}</Text>
    </TouchableHighlight>

    <TouchableHighlight>
      <Text style={styles.linkLabel}>{translation.termsOfUse}</Text>
    </TouchableHighlight>

    <TouchableHighlight onPress={navigateToSupport}>
      <Text style={styles.linkLabel}>{translation.support}</Text>
    </TouchableHighlight>
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  })),
  withHandlers({
    navigateToSupport: ({navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.SUPPORT),
    navigateToChangeWalletName: ({navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.CHANGE_WALLET_NAME),
  })
)(SettingsScreen)
