// @flow

import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigation, useNavigationState} from '@react-navigation/native'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import _ from 'lodash'

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
  walletIsInitializedSelector,
  isFlawedWalletSelector,
  isFetchingAccountStateSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import walletManager from '../../crypto/walletManager'
import {isRegistrationOpen} from '../../crypto/shelley/catalystUtils'
import {updateHistory} from '../../actions/history'
import {checkForFlawedWallets} from '../../actions'
import {Logger} from '../../utils/logging'
import FlawedWalletModal from './FlawedWalletModal'
import StandardModal from '../Common/StandardModal'
import {WALLET_ROOT_ROUTES, CATALYST_ROUTES} from '../../RoutesList'
import {CONFIG, isByron, isHaskellShelley, isNightly} from '../../config/config'

import {formatTokenWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import styles from './styles/TxHistory.style'
import BalanceBanner from './TxHistory/BalanceBanner'
import ActionsBanner from './TxHistory/ActionsBanner'

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

type FundInfo = ?{|
  +registrationStart: string,
  +registrationEnd: string,
|}

type Props = {intl: IntlShape}
const TxHistory = ({intl}: Props) => {
  const navigation = useNavigation()
  const transactionsInfo = useSelector(transactionsInfoSelector)
  const isSyncing = useSelector(isSynchronizingHistorySelector)
  const lastSyncError = useSelector(lastHistorySyncErrorSelector)
  const isOnline = useSelector(isOnlineSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const isFlawedWallet = useSelector(isFlawedWalletSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const isFetchingAccountState = useSelector(isFetchingAccountStateSelector)

  // Byron warning banner
  const [showWarning, setShowWarning] = useState<boolean>(isByron(walletMeta.walletImplementationId))

  // InsufficientFundsModal (Catalyst)
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState<boolean>(false)

  // Catalyst voting registration banner
  const canVote = isHaskellShelley(walletMeta.walletImplementationId)
  const [showCatalystBanner, setShowCatalystBanner] = useState<boolean>(canVote)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(checkForFlawedWallets())
    dispatch(updateHistory())
    dispatch(fetchAccountState())
  }, [dispatch])

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
  const walletIsInitialized = useSelector(walletIsInitializedSelector)

  if (!walletIsInitialized) {
    return <Text>l10n Please wait while wallet is initialized...</Text>
  }

  return (
    <SafeAreaView style={styles.scrollView}>
      <StatusBar type="dark" />
      <View style={styles.container}>
        <OfflineBanner />
        {isOnline && lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

        <BalanceBanner />
        <ActionsBanner />

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
          <ScrollView
            refreshControl={<RefreshControl onRefresh={() => dispatch(updateHistory())} refreshing={isSyncing} />}
          >
            <NoTxHistory />
          </ScrollView>
        ) : (
          <TxHistoryList
            refreshing={isSyncing}
            onRefresh={() => dispatch(updateHistory())}
            navigation={navigation}
            transactions={transactionsInfo}
          />
        )}

        {isByron(walletMeta.walletImplementationId) && showWarning && (
          <WarningBanner
            title={intl.formatMessage(warningBannerMessages.title).toUpperCase()}
            icon={infoIcon}
            message={intl.formatMessage(warningBannerMessages.message)}
            showCloseIcon
            onRequestClose={() => setShowWarning(false)}
            style={styles.warningNoteStyles}
          />
        )}

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

export default injectIntl(TxHistory)
