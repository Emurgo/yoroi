// @flow

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
import DelegationNavigationButtons from './DelegationNavigationButtons'
// import {updateDelegationSummary} from '../../actions/delegationSummary'
import {
  onDidMount,
  requireInitializedWallet,
  withNavigationTitle,
} from '../../utils/renderUtils'

import {formatAdaWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import globalMessages from '../../i18n/global-messages'

const messages = defineMessages({
  noDelegation: {
    id: 'components.delegationsummary.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
  syncErrorBannerTextWithoutRefresh: {
    id: 'components.delegationsummary.syncErrorBannerTextWithoutRefresh',
    defaultMessage: '!!!We are experiencing synchronization issues.',
  },
  syncErrorBannerTextWithRefresh: {
    id: 'components.delegationsummary.syncErrorBannerTextWithRefresh',
    defaultMessage:
      '!!!We are experiencing synchronization issues. Pull to refresh',
  },
})

const NoDelegationSummary = injectIntl(({intl}) => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>
      {intl.formatMessage(messages.noDelegation)}
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

const DelegationSummary = ({
  // amountPending,
  // transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  // updateHistory,
  lastSyncError,
  // availableAmount,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <StatusBar type="dark" />
    <View style={styles.container}>
      <OfflineBanner />
      {isOnline &&
      lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

      <Text>Delegation Summary</Text>
      {/*<AvailableAmountBanner amount={availableAmount} />*/}

      {/*{_.isEmpty(transactionsInfo) ? (*/}
      {/*  <ScrollView*/}
      {/*    refreshControl={*/}
      {/*      <RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />*/}
      {/*    }*/}
      {/*  >*/}
      {/*    <NoTxHistory />*/}
      {/*  </ScrollView>*/}
      {/*) : (*/}
      {/*  <TxHistoryList*/}
      {/*    refreshing={isSyncing}*/}
      {/*    onRefresh={updateHistory}*/}
      {/*    navigation={navigation}*/}
      {/*    transactions={transactionsInfo}*/}
      {/*  />*/}
      {/*)}*/}

      <DelegationNavigationButtons navigation={navigation} />
    </View>
  </SafeAreaView>
)

type ExternalProps = {|
  navigation: Navigation,
|}

export default injectIntl(
  (compose(
    // requireInitializedWallet, // TODO(shin) enable this before release
    connect(
      (state: State) => ({
        // transactionsInfo: transactionsInfoSelector(state),
        isSyncing: isSynchronizingHistorySelector(state),
        lastSyncError: lastHistorySyncErrorSelector(state),
        isOnline: isOnlineSelector(state),
        // availableAmount: availableAmountSelector(state),
        walletName: walletNameSelector(state),
        key: languageSelector(state),
      }),
      // {
      //   updateHistory,
      // },
    ),
    // o:w
    // nDidMount(({updateHistory}) => {
    //   updateHistory()
    // }),
    withNavigationTitle(({walletName}) => walletName),
  )(DelegationSummary): ComponentType<ExternalProps>),
)
