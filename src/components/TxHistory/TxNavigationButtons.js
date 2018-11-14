// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'

import {Button} from '../UiKit'
import styles from './styles/TxNavigationButtons.style'
import {WALLET_ROUTES} from '../../RoutesList'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TxNavigationButtons

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const TxNavigationButtons = ({
  navigation,
  navigateToReceive,
  navigateToSend,
  translations,
}: Props) => (
  <View style={styles.container}>
    <Button
      block
      onPress={navigateToSend}
      title={translations.sendButton}
      style={styles.firstButton}
    />
    <Button
      block
      onPress={navigateToReceive}
      title={translations.receiveButton}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateToReceive: ({navigation}) => (event) =>
      navigation.navigate(WALLET_ROUTES.RECEIVE),
    navigateToSend: ({navigation}) => (event) =>
      navigation.navigate(WALLET_ROUTES.SEND),
  }),
)(TxNavigationButtons)
