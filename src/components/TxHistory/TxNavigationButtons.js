// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {hasAnyTransaction, walletMetaSelector} from '../../selectors'
import {WALLET_ROUTES} from '../../RoutesList'
import NavButton from './NavButton'
import {isHaskellShelley} from '../../config/config'

import styles from './styles/TxNavigationButtons.style'

import iconSend from '../../assets/img/icon/send.png'
import iconReceive from '../../assets/img/icon/receive.png'
import iconDashboard from '../../assets/img/icon/dashboard.png'
import iconDelegate from '../../assets/img/icon/delegation.png'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {WalletMeta} from '../../state'

const messages = defineMessages({
  sendButton: {
    id: 'components.txhistory.txnavigationbuttons.sendButton',
    defaultMessage: '!!!Send',
  },
  receiveButton: {
    id: 'components.txhistory.txnavigationbuttons.receiveButton',
    defaultMessage: '!!!Receive',
  },
  dashboardButton: {
    id: 'components.common.navigation.dashboardButton',
    defaultMessage: '!!!Dashboard',
  },
  delegateButton: {
    id: 'components.common.navigation.delegateButton',
    defaultMessage: '!!!Delegate',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToReceive: () => mixed,
  navigateToSend: () => mixed,
  navigateToDashboard: () => mixed,
  navigateToDelegate: () => mixed,
  intl: any,
  sendDisabled: boolean,
  walletMeta: $Diff<WalletMeta, {id: string}>,
}

const TxNavigationButtons = ({
  navigateToReceive,
  navigateToSend,
  navigateToDashboard,
  navigateToDelegate,
  intl,
  sendDisabled,
  walletMeta,
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
    {isHaskellShelley(walletMeta.walletImplementationId) && (
      <>
        <NavButton
          block
          onPress={navigateToDashboard}
          iconImage={iconDashboard}
          title={intl.formatMessage(messages.dashboardButton)}
        />
        <NavButton
          block
          disabled={sendDisabled}
          onPress={navigateToDelegate}
          iconImage={iconDelegate}
          title={intl.formatMessage(messages.delegateButton)}
        />
      </>
    )}
  </View>
)

export default injectIntl(
  compose(
    connect((state) => ({
      sendDisabled: !hasAnyTransaction(state),
      walletMeta: walletMetaSelector(state),
    })),
    withHandlers({
      navigateToReceive: ({navigation}) => (_event) =>
        navigation.navigate(WALLET_ROUTES.RECEIVE),
      navigateToSend: ({navigation}) => (_event) => {
        navigation.navigate(WALLET_ROUTES.SEND)
      },
      navigateToDashboard: ({navigation}) => (_event) => {
        navigation.navigate(WALLET_ROUTES.DASHBOARD)
      },
      navigateToDelegate: ({navigation}) => (_event) => {
        navigation.navigate(WALLET_ROUTES.DELEGATE)
      },
    }),
  )(TxNavigationButtons),
)
