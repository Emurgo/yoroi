// @flow

import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {useNavigationState} from '@react-navigation/native'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {fetchAccountState} from '../../actions/account'
import VotingBanner from '../Catalyst/VotingBanner'
import {Text, Banner, OfflineBanner, StatusBar, WarningBanner} from '../UiKit'
import infoIcon from '../../assets/img/icon/info-light-green.png'
import {
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  tokenBalanceSelector,
  availableAssetsSelector,
  walletMetaSelector,
  languageSelector,
  isFlawedWalletSelector,
  isFetchingAccountStateSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import walletManager from '../../crypto/walletManager'
import {MultiToken} from '../../crypto/MultiToken'
import {isRegistrationOpen} from '../../crypto/shelley/catalystUtils'
import {updateHistory} from '../../actions/history'
import {checkForFlawedWallets} from '../../actions'
import {onDidMount, requireInitializedWallet} from '../../utils/renderUtils'
import {Logger} from '../../utils/logging'
import FlawedWalletModal from './FlawedWalletModal'
import StandardModal from '../Common/StandardModal'
import {WALLET_ROOT_ROUTES, CATALYST_ROUTES} from '../../RoutesList'
import {CONFIG, isByron, isHaskellShelley, isNightly} from '../../config/config'

import {formatTokenWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'

import styles from './styles/TxHistory.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {TransactionInfo, Token} from '../../types/HistoryTransaction'

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
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
})

const NoTxHistory = injectIntl(({intl}: {intl: IntlShape}) => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>{intl.formatMessage(messages.noTransactions)}</Text>
  </View>
))

const SyncErrorBanner = injectIntl(({intl, showRefresh}: {intl: IntlShape, showRefresh: any}) => (
  <Banner
    error
    text={
      showRefresh
        ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
        : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
    }
  />
))

type AvailableAmountProps = {|
  intl: IntlShape,
  amount: BigNumber,
  amountAssetMetaData: Token,
|}
const AvailableAmountBanner = injectIntl(({intl, amount, amountAssetMetaData}: AvailableAmountProps) => (
  <Banner
    label={intl.formatMessage(globalMessages.availableFunds)}
    text={amount != null ? formatTokenWithText(amount, amountAssetMetaData) : '-'}
    boldText
  />
))

type FundInfo = ?{|
  +registrationStart: string,
  +registrationEnd: string,
|}

type Props = {|
  transactionsInfo: Dict<TransactionInfo>,
  navigation: Navigation,
  isSyncing: boolean,
  isOnline: boolean,
  fetchAccountState: () => Promise<void>,
  isFetchingAccountState: boolean,
  updateHistory: () => Promise<void>,
  lastSyncError: any,
  tokenBalance: MultiToken,
  availableAssets: Dict<Token>,
  isFlawedWallet: boolean,
  walletMeta: ReturnType<typeof walletMetaSelector>,
  intl: IntlShape,
|}
const TxHistory = ({
  transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  fetchAccountState,
  isFetchingAccountState,
  updateHistory,
  lastSyncError,
  tokenBalance,
  availableAssets,
  isFlawedWallet,
  walletMeta,
  intl,
}: Props) => {
  // Byron warning banner

  const [showWarning, setShowWarning] = useState<boolean>(isByron(walletMeta.walletImplementationId))

  // InsufficientFundsModal (Catalyst)

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState<boolean>(false)

  // fetch account state

  useEffect(() => {
    fetchAccountState()
  }, [fetchAccountState])

  // Catalyst voting registration banner

  const canVote = isHaskellShelley(walletMeta.walletImplementationId)

  const [showCatalystBanner, setShowCatalystBanner] = useState<boolean>(canVote)

  useEffect(() => {
    const checkCatalystFundInfo = async () => {
      let fundInfo: FundInfo = null
      if (canVote) {
        try {
          const {currentFund} = await walletManager.fetchFundInfo()
          if (currentFund != null) {
            fundInfo = {
              registrationStart: currentFund.registrationStart,
              registrationEnd: currentFund.registrationEnd,
            }
          }
        } catch (e) {
          Logger.debug('Could not get Catalyst fund info from server', e)
        }
      }
      setShowCatalystBanner((canVote && isRegistrationOpen(fundInfo)) || isNightly() || __DEV__)
    }

    checkCatalystFundInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // handles back button (closes wallet)

  const routes = useNavigationState((state) => state.routes)

  // TODO: move this to dashboard once it's set as default screen
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        navigation.dispatch(e.data.action)
        if (routes.length === 1) {
          // this is the last and only route in the stack, wallet should close
          walletManager.closeWallet()
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  )

  const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

  return (
    <SafeAreaView style={styles.scrollView}>
      <StatusBar type="dark" />
      <View style={styles.container}>
        <OfflineBanner />
        {isOnline && lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

        <AvailableAmountBanner
          amount={tokenBalance.getDefault()}
          amountAssetMetaData={availableAssets[tokenBalance.getDefaultId()]}
        />

        {showCatalystBanner && (
          <VotingBanner
            onPress={() => {
              if (tokenBalance.getDefault().lt(CONFIG.CATALYST.MIN_ADA)) {
                setShowInsufficientFundsModal(true)
                return
              }
              navigation.navigate(CATALYST_ROUTES.ROOT)
            }}
            disabled={isFetchingAccountState}
          />
        )}
        {isFlawedWallet === true && (
          <FlawedWalletModal
            visible={isFlawedWallet === true}
            disableButtons={false}
            onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)}
            onRequestClose={() => navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)}
          />
        )}

        {_.isEmpty(transactionsInfo) ? (
          <ScrollView refreshControl={<RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />}>
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

        {
          /* eslint-disable indent */
          isByron(walletMeta.walletImplementationId) && showWarning && (
            <WarningBanner
              title={intl.formatMessage(warningBannerMessages.title).toUpperCase()}
              icon={infoIcon}
              message={intl.formatMessage(warningBannerMessages.message)}
              showCloseIcon
              onRequestClose={() => setShowWarning(false)}
              style={styles.warningNoteStyles}
            />
          )
          /* eslint-enable indent */
        }

        <StandardModal
          visible={showInsufficientFundsModal}
          title={intl.formatMessage(globalMessages.attention)}
          onRequestClose={() => setShowInsufficientFundsModal(false)}
          primaryButton={{
            label: intl.formatMessage(confirmationMessages.commonButtons.backButton),
            onPress: () => setShowInsufficientFundsModal(false),
          }}
          showCloseIcon
        >
          <View>
            <Text>
              {intl.formatMessage(globalMessages.insufficientBalance, {
                requiredBalance: formatTokenWithText(CONFIG.CATALYST.DISPLAYED_MIN_ADA, assetMetaData),
                currentBalance: formatTokenWithText(tokenBalance.getDefault(), assetMetaData),
              })}
            </Text>
          </View>
        </StandardModal>
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: any,
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
        tokenBalance: tokenBalanceSelector(state),
        availableAssets: availableAssetsSelector(state),
        key: languageSelector(state),
        isFlawedWallet: isFlawedWalletSelector(state),
        walletMeta: walletMetaSelector(state),
        isFetchingAccountState: isFetchingAccountStateSelector(state),
      }),
      {
        updateHistory,
        checkForFlawedWallets,
        fetchAccountState,
      },
    ),
    onDidMount(({updateHistory, checkForFlawedWallets}) => {
      checkForFlawedWallets()
      updateHistory()
    }),
  )(TxHistory): ComponentType<ExternalProps>),
)
