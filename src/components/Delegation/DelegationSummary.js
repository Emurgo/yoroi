// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {BigNumber} from 'bignumber.js'
import {injectIntl, defineMessages} from 'react-intl'

import {Banner, OfflineBanner, StatusBar} from '../UiKit'
import {
  EpochProgress,
  UpcomingRewardInfo,
  UserSummary,
  DelegatedStakepoolInfo,
  NotDelegatedInfo,
} from './dashboard'
import {
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  walletNameSelector,
  languageSelector,
} from '../../selectors'
import DelegationNavigationButtons from './DelegationNavigationButtons'
import {withNavigationTitle} from '../../utils/renderUtils'

import {formatAdaWithText} from '../../utils/format'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'

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

const DelegationSummary = ({
  navigation,
  isSyncing,
  isOnline,
  lastSyncError,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <StatusBar type="dark" />
    <View style={styles.container}>
      <OfflineBanner />
      {isOnline &&
        lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

      <ScrollView>
        <NotDelegatedInfo />
        <View style={styles.inner}>
          <UpcomingRewardInfo
            nextRewardText={'Jan 21st 04:13 AM'}
            followingRewardText={'Jan 22nd 04:13 AM'}
            showDisclaimer
          />
          <EpochProgress
            percentage={40}
            currentEpoch={4}
            endTime={{
              h: '12',
              m: '15',
              s: '13',
            }}
          />
          <UserSummary
            totalAdaSum={formatAdaWithText(new BigNumber(1000))}
            totalRewards={formatAdaWithText(new BigNumber(200))}
            totalDelegated={formatAdaWithText(new BigNumber(300))}
          />
          <DelegatedStakepoolInfo
            poolTicker="1EMUR"
            poolName="EMURGO’s STAKEPOOL"
            poolHash="7186b11017e877329798ac925480585208516c4e5c30b69e38f0b997e7b72a83"
          />
        </View>
      </ScrollView>
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
        isSyncing: isSynchronizingHistorySelector(state),
        lastSyncError: lastHistorySyncErrorSelector(state),
        isOnline: isOnlineSelector(state),
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
