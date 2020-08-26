// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {hasAnyTransaction, isHWSelector} from '../../selectors'
import {WALLET_ROUTES} from '../../RoutesList'
import {Button} from '../UiKit'
import {showErrorDialog} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

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
  navigateToDelegate,
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
      style={styles.firstButton}
      iconImage={iconReceive}
    />
    {/* TODO: {isShelley && ( */}
    <Button
      block
      onPress={navigateToDelegate}
      /* iconImage={iconReceive} */
      title={'₳ Delegate'}
    />
  </View>
)

export default injectIntl(
  compose(
    connect((state) => ({
      sendDisabled: !hasAnyTransaction(state),
      isHW: isHWSelector(state),
    })),
    withHandlers({
      navigateToReceive: ({navigation}) => (event) =>
        navigation.navigate(WALLET_ROUTES.RECEIVE),
      navigateToSend: ({navigation, isHW, intl}) => (event) => {
        if (isHW) {
          showErrorDialog(errorMessages.notSupportedError, intl)
          return
        }
        navigation.navigate(WALLET_ROUTES.SEND)
      },
      navigateToDelegate: ({navigation, isHW, intl}) => (event) => {
        if (isHW) {
          showErrorDialog(errorMessages.notSupportedError, intl)
          return
        }
        navigation.navigate(WALLET_ROUTES.DELEGATE)
      },
    }),
  )(TxNavigationButtons),
)
