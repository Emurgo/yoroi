// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl} from 'react-native'
import _ from 'lodash'

import {Text} from '../UiKit'
import {
  amountPendingSelector,
  transactionsSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import Screen from '../../components/Screen'
import TxNavigationButtons from './TxNavigationButtons'
import {updateHistory, updateHistoryInBackground} from '../../actions/history'
import {onDidMount} from '../../utils/renderUtils'
import {printAda} from '../../utils/transactions'
import {CONFIG} from '../../config'

import styles from './styles/TxHistory.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const OfflineBanner = () => <Text>You are offline!</Text>

const NoTxHistory = () => <Text> You have no transactions yet ... </Text>

const SyncErrorBanner = ({showRefresh, onRefresh}) => (
  // eslint-disable-next-line
  <View style={{flexDirection: 'row'}}>
    <Text>We are experiencing synchronization issues. Try refreshing... </Text>
    {showRefresh && <Text onPress={onRefresh}>{'\u21BB'}</Text>}
  </View>
)

const PendingAmount = ({amount}) => (
  <Text> Pending amount: {printAda(amount)} </Text>
)

const TxHistory = ({
  amountPending,
  transactions,
  navigation,
  isSyncing,
  isOnline,
  updateHistory,
  lastSyncError,
}) => (
  <View style={styles.root}>
    {!isOnline && <OfflineBanner />}
    {lastSyncError && (
      <SyncErrorBanner showRefresh={!isSyncing} onRefresh={updateHistory} />
    )}
    {/* TODO(ppershing): What should we do if amountPending is zero?
      Should we show it? Note that isn't case for intrawallet transactions
      because amountPending is brutto and thus negative due to fee
    */}
    {amountPending && <PendingAmount amount={amountPending} />}
    <Screen
      scroll
      refreshControl={
        <RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />
      }
    >
      {_.isEmpty(transactions) ? (
        <NoTxHistory />
      ) : (
        <TxHistoryList navigation={navigation} transactions={transactions} />
      )}
    </Screen>

    <TxNavigationButtons navigation={navigation} />
  </View>
)

type ExternalProps = {|
  navigation: NavigationScreenProp<NavigationState>,
|}

export default (compose(
  connect(
    (state: State) => ({
      transactions: transactionsSelector(state),
      amountPending: amountPendingSelector(state),
      isSyncing: isSynchronizingHistorySelector(state),
      lastSyncError: lastHistorySyncErrorSelector(state),
      isOnline: isOnlineSelector(state),
      updateHistory,
    }),
    {
      updateHistory,
      updateHistoryInBackground,
    },
  ),
  // TODO(ppershing): this should be handled
  // by some history manager
  // FIXME(ppershing): we do not clean interval on unmount
  onDidMount(({updateHistory, updateHistoryInBackground}) => {
    updateHistory()
    setInterval(updateHistoryInBackground, CONFIG.HISTORY_REFRESH_TIME)
  }),
)(TxHistory): ComponentType<ExternalProps>)
