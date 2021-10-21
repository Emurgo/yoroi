// @flow

import {useNavigation, useNavigationState} from '@react-navigation/native'
import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useDispatch, useSelector} from 'react-redux'

import {checkForFlawedWallets} from '../../actions'
import {fetchAccountState} from '../../actions/account'
import {updateHistory} from '../../actions/history'
import infoIcon from '../../assets/img/icon/info-light-green.png'
import {CONFIG, isByron, isHaskellShelley, isNightly} from '../../config/config'
import {isRegistrationOpen} from '../../crypto/shelley/catalystUtils'
import walletManager from '../../crypto/walletManager'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {
  availableAssetsSelector,
  isFetchingAccountStateSelector,
  isFlawedWalletSelector,
  isOnlineSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  tokenBalanceSelector,
  transactionsInfoSelector,
  walletIsInitializedSelector,
  walletMetaSelector,
} from '../../selectors'
import {formatTokenWithText} from '../../utils/format'
import {Logger} from '../../utils/logging'
import VotingBanner from '../Catalyst/VotingBanner'
import StandardModal from '../Common/StandardModal'
import {OfflineBanner, StatusBar, Text, WarningBanner} from '../UiKit'
import ActionsBanner from './components/ActionsBanner'
import BalanceBanner from './components/BalanceBanner'
import EmptyHistory from './components/EmptyHistory'
import SyncErrorBanner from './components/SyncErrorBanner'
import TabNavigator from './components/TabNavigator'
import FlawedWalletModal from './FlawedWalletModal'
import TxHistoryList from './TxHistoryList'

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

const styles = StyleSheet.create({
  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  warningNoteStyles: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
  },
})

type FundInfo = ?{|
  +registrationStart: string,
  +registrationEnd: string,
|}

const TxHistory = () => {
  const intl = useIntl()
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
      <StatusBar type="light" />
      <View style={styles.container}>
        <OfflineBanner />
        {isOnline && lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

        <BalanceBanner />
        <ActionsBanner />
        <TabNavigator
          tabs={['Transactions', 'Assets']}
          render={({active}) => {
            if (active === 0) {
              return (
                <View style={styles.tabNavigatorRoot}>
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
                      refreshControl={
                        <RefreshControl onRefresh={() => dispatch(updateHistory())} refreshing={isSyncing} />
                      }
                    >
                      <EmptyHistory />
                    </ScrollView>
                  ) : (
                    <TxHistoryList
                      refreshing={isSyncing}
                      onRefresh={() => dispatch(updateHistory())}
                      navigation={navigation}
                      transactions={transactionsInfo}
                    />
                  )}
                </View>
              )
            }
            return <View />
          }}
        />

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

export default TxHistory
