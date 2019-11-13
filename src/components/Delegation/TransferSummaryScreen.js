// @flow

// TODO
// this is just a placeholder, a clone of TxHistory.js

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'
import {injectIntl, defineMessages} from 'react-intl'

import {Text, Banner, OfflineBanner, StatusBar} from '../UiKit'
import {
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  availableAmountSelector,
  walletNameSelector,
  languageSelector,
} from '../../selectors'
import TxHistoryList from '../TxHistory/TxHistoryList'
import TxNavigationButtons from '../TxHistory/TxNavigationButtons'
import {updateHistory} from '../../actions/history'
import {
  onDidMount,
  requireInitializedWallet,
  withNavigationTitle,
} from '../../utils/renderUtils'

import {formatAdaWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from '../TxHistory/styles/TxHistory.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import globalMessages from '../../i18n/global-messages'

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
  syncErrorBannerTextWithoutRefresh: {
    id: 'components.txhistory.txhistory.syncErrorBannerTextWithoutRefresh',
    defaultMessage: '!!!We are experiencing synchronization issues.',
  },
  syncErrorBannerTextWithRefresh: {
    id: 'components.txhistory.txhistory.syncErrorBannerTextWithRefresh',
    defaultMessage:
      '!!!We are experiencing synchronization issues. Pull to refresh',
  },
})

const NoTxHistory = injectIntl(({intl}) => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>
      {intl.formatMessage(messages.noTransactions)}
    </Text>
  </View>
))

const SyncErrorBanner = injectIntl(({intl, showRefresh}) => (
  <Banner
    error
    text={
      showRefresh
        ? intl.formatMessage(messages.syncErrorBannerTextWithRefresh)
        : intl.formatMessage(messages.syncErrorBannerTextWithoutRefresh)
    }
  />
))

const AvailableAmountBanner = injectIntl(({intl, amount}) => (
  <Banner
    label={intl.formatMessage(globalMessages.availableFunds)}
    text={formatAdaWithText(amount)}
    boldText
  />
))

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

export default injectIntl(
  (compose(
    requireInitializedWallet,
    connect(
      (state: State) => ({
        transactionsInfo: transactionsInfoSelector(state),
        isSyncing: isSynchronizingHistorySelector(state),
        lastSyncError: lastHistorySyncErrorSelector(state),
        isOnline: isOnlineSelector(state),
        availableAmount: availableAmountSelector(state),
        walletName: walletNameSelector(state),
        key: languageSelector(state),
      }),
      {
        updateHistory,
      },
    ),
    onDidMount(({updateHistory}) => {
      updateHistory()
    }),
    withNavigationTitle(({walletName}) => walletName),
  )(TxHistory): ComponentType<ExternalProps>),
)
