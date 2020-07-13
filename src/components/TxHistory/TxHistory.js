// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'
import {injectIntl, defineMessages} from 'react-intl'

import {Text, Banner, OfflineBanner, StatusBar, WarningBanner} from '../UiKit'
import infoIcon from '../../assets/img/icon/info-light-green.png'
import {
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  availableAmountSelector,
  walletNameSelector,
  languageSelector,
  isFlawedWalletSelector,
  isWarningBannerOpen,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import TxNavigationButtons from './TxNavigationButtons'
import {updateHistory, closeWarningBannerNote} from '../../actions/history'
import {checkForFlawedWallets} from '../../actions'
import {
  onDidMount,
  requireInitializedWallet,
  withNavigationTitle,
} from '../../utils/renderUtils'
import FlawedWalletModal from './FlawedWalletModal'
import {WALLET_INIT_ROUTES} from '../../RoutesList'

import {formatAdaWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from './styles/TxHistory.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import globalMessages from '../../i18n/global-messages'

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const warningBannerMessages = defineMessages({
  title: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage:
      '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
  buttonText: {
    id: 'components.txhistory.txhistory.warningbanner.buttonText',
    defaultMessage: '!!!Upgrade',
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
        ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
        : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
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
  isFlawedWallet,
  isWarningNoteOpen,
  closeWarningBannerNote,
  intl,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <StatusBar type="dark" />
    <View style={styles.container}>
      <FlawedWalletModal
        visible={isFlawedWallet === true}
        disableButtons={false}
        onPress={() => navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)}
        onRequestClose={() =>
          navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
        }
      />
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
      <WarningBanner
        title={intl.formatMessage(warningBannerMessages.title).toUpperCase()}
        icon={infoIcon}
        message={intl.formatMessage(warningBannerMessages.message)}
        showCloseIcon={isWarningNoteOpen}
        onRequestClose={() => closeWarningBannerNote(false)}
        buttonTitle={intl
          .formatMessage(warningBannerMessages.buttonText)
          .toUpperCase()}
        // eslint-disable-next-line no-alert
        action={() => alert('Upgrade pressed')}
        style={[
          styles.warningNoteStyles,
          !isWarningNoteOpen && styles.noWarningBanner,
        ]}
      />
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
        isFlawedWallet: isFlawedWalletSelector(state),
        isWarningNoteOpen: isWarningBannerOpen(state),
      }),
      {
        updateHistory,
        checkForFlawedWallets,
        closeWarningBannerNote,
      },
    ),
    onDidMount(({updateHistory, checkForFlawedWallets}) => {
      checkForFlawedWallets()
      updateHistory()
    }),
    withNavigationTitle(({walletName}) => walletName),
  )(TxHistory): ComponentType<ExternalProps>),
)
