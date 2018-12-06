// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Text, Banner, OfflineBanner, StatusBar} from '../UiKit'
import {
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

const getTranslations = (state: State) => state.trans.TransactionHistoryScreeen

const NoTxHistory = withTranslations(getTranslations)(({translations}) => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>{translations.noTransactions}</Text>
  </View>
))

const SyncErrorBanner = withTranslations(getTranslations)(
  ({translations, showRefresh}) => (
    <Banner
      error
      text={
        showRefresh
          ? translations.syncErrorBanner.textWithRefresh
          : translations.syncErrorBanner.textWithoutRefresh
      }
    />
  ),
)

const AvailableAmountBanner = withTranslations(getTranslations)(
  ({translations, amount}) => (
    <Banner
      label={translations.availableAmountBanner.label}
      text={`${formatAda(amount)} ${
        translations.availableAmountBanner.ADASymbol
      }`}
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
    <StatusBar type="dark" />
    <View style={styles.container}>
      <OfflineBanner />
      {isOnline &&
        lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

      <AvailableAmountBanner amount={availableAmount} />

      {_.isEmpty(transactionsInfo) ? (
        <ScrollView
          refreshControl={
            <RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />
          }
        >
          <NoTxHistory />
        </ScrollView>
      ) : (
        <TxHistoryList
          refreshing={isSyncing}
          onRefresh={updateHistory}
          navigation={navigation}
          transactions={transactionsInfo}
        />
      )}

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
  onDidMount(({updateHistory}) => {
    updateHistory()
  }),
  withNavigationTitle(({walletName}) => walletName),
)(TxHistory): ComponentType<ExternalProps>)
