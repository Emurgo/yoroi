// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {hasAnyTransaction} from '../../selectors'
import {WALLET_ROUTES} from '../../RoutesList'
import {Button} from '../UiKit'

import styles from './styles/TxNavigationButtons.style'

import iconSend from '../../assets/img/icon/send.png'
import iconReceive from '../../assets/img/icon/receive.png'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const messages = defineMessages({
  sendButton: {
    id: 'components.txhistory.txnavigationbuttons.sendButton',
    defaultMessage: '!!!Send',
  },
  receiveButton: {
    id: 'components.txhistory.txnavigationbuttons.receiveButton',
    defaultMessage: '!!!Receive',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
  intl: any,
  sendDisabled: boolean,
}

const TxNavigationButtons = ({
  navigation,
  navigateToReceive,
  navigateToSend,
  intl,
  sendDisabled,
}: Props) => (
  <View style={styles.container}>
    <Button
      block
      disabled={sendDisabled}
      onPress={navigateToSend}
      title={intl.formatMessage(messages.sendButton)}
      style={styles.firstButton}
      iconImage={iconSend}
    />
    <Button
      block
      onPress={navigateToReceive}
      title={intl.formatMessage(messages.receiveButton)}
      iconImage={iconReceive}
    />
  </View>
)

export default injectIntl(compose(
  connect((state) => ({
    sendDisabled: !hasAnyTransaction(state),
  })),
  withHandlers({
    navigateToReceive: ({navigation}) => (event) =>
      navigation.navigate(WALLET_ROUTES.RECEIVE),
    navigateToSend: ({navigation}) => (event) =>
      navigation.navigate(WALLET_ROUTES.SEND),
  }),
)(TxNavigationButtons))
