// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl, ScrollView, Image, StatusBar} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Text, Banner, OfflineBanner} from '../UiKit'
import {
  amountPendingSelector,
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  availableAmountSelector,
  walletNameSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import TxNavigationButtons from './TxNavigationButtons'
import {updateHistory} from '../../actions/history'
import {
  onDidMount,
  RenderCount,
  measureRenderTime,
  requireInitializedWallet,
  withTranslations,
  withNavigationTitle,
} from '../../utils/renderUtils'

import {formatAda} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from './styles/TxHistory.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.TxHistory

const NoTxHistory = () => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>No transactions to show yet</Text>
  </View>
)

const SyncErrorBanner = ({showRefresh}) => (
  <Banner
    error
    text={`We are experiencing synchronization issues. ${
      showRefresh ? 'Refreshing.' : 'Pull to refresh.'
    }`}
  />
)

const PendingAmount = ({amount}) => (
  <Banner text={formatAda(amount)} label="Pending amount" />
)

const AvailableAmount = withTranslations(getTranslations)(
  ({translations, amount}) => (
    <Banner
      text={`${formatAda(amount)} ADA`}
      label={translations.availableAmount.label}
    />
  ),
)

const TxHistory = ({
  amountPending,
  transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  updateHistory,
  lastSyncError,
  availableAmount,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <StatusBar barStyle="light-content" backgroundColor="#254BC9" />
    <View style={styles.container}>
      <RenderCount />
      <OfflineBanner />
      {isOnline &&
        lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}
      {/* TODO(ppershing): What should we do if amountPending is zero?
      Should we show it? Note that isn't case for intrawallet transactions
      because amountPending is brutto and thus negative due to fee
    */}
      {amountPending && <PendingAmount amount={amountPending} />}
      <AvailableAmount amount={availableAmount} />
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
      availableAmount: availableAmountSelector(state),
      walletName: walletNameSelector(state),
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
  withNavigationTitle(({walletName}) => walletName),
)(TxHistory): ComponentType<ExternalProps>)
