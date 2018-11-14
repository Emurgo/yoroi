// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Text} from '../UiKit'
import {
  amountPendingSelector,
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import TxNavigationButtons from './TxNavigationButtons'
import {updateHistory} from '../../actions/history'
import {
  onDidMount,
  RenderCount,
  measureRenderTime,
  requireInitializedWallet,
} from '../../utils/renderUtils'

import {formatAda} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from './styles/TxHistory.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const OfflineBanner = () => (
  <View style={[styles.banner, styles.bannerError]}>
    <Text light style={styles.bannerText}>
      You are offline. Please check settings on your device.
    </Text>
  </View>
)

const NoTxHistory = () => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>No transactions to show yet</Text>
  </View>
)

const SyncErrorBanner = ({showRefresh}) => (
  <View style={[styles.banner, styles.bannerError]}>
    <Text light style={styles.bannerText}>
      We are experiencing synchronization issues.{' '}
      {showRefresh ? 'Refreshing.' : 'Pull to refresh.'}
    </Text>
  </View>
)

const PendingAmount = ({amount}) => (
  <View style={styles.banner}>
    <Text> Pending amount: {formatAda(amount)} </Text>
  </View>
)

const TxHistory = ({
  amountPending,
  transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  updateHistory,
  lastSyncError,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <View style={styles.container}>
      <RenderCount />
      {!isOnline && <OfflineBanner />}
      {lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}
      {/* TODO(ppershing): What should we do if amountPending is zero?
      Should we show it? Note that isn't case for intrawallet transactions
      because amountPending is brutto and thus negative due to fee
    */}
      {amountPending && <PendingAmount amount={amountPending} />}
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />
        }
      >
        {_.isEmpty(transactionsInfo) ? (
          <NoTxHistory />
        ) : (
          <TxHistoryList
            navigation={navigation}
            transactions={transactionsInfo}
          />
        )}
      </ScrollView>

      <TxNavigationButtons navigation={navigation} />
    </View>
  </SafeAreaView>
)

type ExternalProps = {|
  navigation: Navigation,
|}

export default (compose(
  requireInitializedWallet,
  connect(
    (state: State) => ({
      transactionsInfo: transactionsInfoSelector(state),
      amountPending: amountPendingSelector(state),
      isSyncing: isSynchronizingHistorySelector(state),
      lastSyncError: lastHistorySyncErrorSelector(state),
      isOnline: isOnlineSelector(state),
    }),
    {
      updateHistory,
    },
  ),
  measureRenderTime('TxHistory'),
  // TODO(ppershing): this should be handled
  // by some history manager
  // FIXME(ppershing): we do not clean interval on unmount
  onDidMount(({updateHistory}) => {
    updateHistory()
  }),
)(TxHistory): ComponentType<ExternalProps>)
