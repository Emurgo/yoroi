// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {hasAnyTransaction, isHWSelector} from '../../selectors'
import {WALLET_ROUTES} from '../../RoutesList'
import NavButton from './NavButton'
import {showErrorDialog} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/TxNavigationButtons.style'

import iconSend from '../../assets/img/icon/send.png'
import iconReceive from '../../assets/img/icon/receive.png'
import iconDelegate from '../../assets/img/icon/delegation.png'

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
  delegateButton: {
    id: 'components.txhistory.txnavigationbuttons.delegateButton',
    defaultMessage: '!!!Delegate',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
  navigateToDashboard: () => mixed,
  intl: any,
  sendDisabled: boolean,
}

const TxNavigationButtons = ({
  navigation,
  navigateToReceive,
  navigateToSend,
  navigateToDashboard,
  intl,
  sendDisabled,
}: Props) => (
  <View style={styles.container}>
    <NavButton
      block
      disabled={sendDisabled}
      onPress={navigateToSend}
      title={intl.formatMessage(messages.sendButton)}
      iconImage={iconSend}
    />
    <NavButton
      block
      onPress={navigateToReceive}
      title={intl.formatMessage(messages.receiveButton)}
      iconImage={iconReceive}
    />
    {/* TODO: {isShelley && ( */}
    <NavButton
      block
      onPress={navigateToDashboard}
      iconImage={iconDelegate}
      title={intl.formatMessage(messages.delegateButton)}
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
      navigateToDashboard: ({navigation, isHW, intl}) => (event) => {
        if (isHW) {
          showErrorDialog(errorMessages.notSupportedError, intl)
          return
        }
        navigation.navigate(WALLET_ROUTES.DASHBOARD)
      },
      // TODO
      // navigateToDelegate: ({navigation, isHW, intl}) => (event) => {
      //   if (isHW) {
      //     showErrorDialog(errorMessages.notSupportedError, intl)
      //     return
      //   }
      //   navigation.navigate(WALLET_ROUTES.DELEGATE)
      // },
    }),
  )(TxNavigationButtons),
)
