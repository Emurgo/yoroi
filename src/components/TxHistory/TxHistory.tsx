import {useNavigation, useNavigationState} from '@react-navigation/native'
import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useDispatch, useSelector} from 'react-redux'

import {checkForFlawedWallets} from '../../../legacy/actions'
import {fetchAccountState} from '../../../legacy/actions/account'
import {updateHistory} from '../../../legacy/actions/history'
import infoIcon from '../../../legacy/assets/img/icon/info-light-green.png'
import VotingBanner from '../../../legacy/components/Catalyst/VotingBanner'
import StandardModal from '../../../legacy/components/Common/StandardModal'
import {OfflineBanner, StatusBar, Text, WarningBanner} from '../../../legacy/components/UiKit'
import {CONFIG, isByron, isHaskellShelley, isNightly} from '../../../legacy/config/config'
import {isRegistrationOpen} from '../../../legacy/crypto/shelley/catalystUtils'
import walletManager from '../../../legacy/crypto/walletManager'
import globalMessages, {confirmationMessages} from '../../../legacy/i18n/global-messages'
import {CATALYST_ROUTES} from '../../../legacy/RoutesList'
import {
  availableAssetsSelector,
  isFetchingAccountStateSelector,
  isOnlineSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  tokenBalanceSelector,
  transactionsInfoSelector,
  walletIsInitializedSelector,
  walletMetaSelector,
} from '../../../legacy/selectors'
import {formatTokenWithText} from '../../../legacy/utils/format'
import {Logger} from '../../../legacy/utils/logging'
import WalletHero from '../WalletHero/WalletHero'
import EmptyHistory from './EmptyHistory'
import SyncErrorBanner from './SyncErrorBanner'
import TxHistoryList from './TxHistoryList'

const TxHistory = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const transactionsInfo = useSelector(transactionsInfoSelector)
  const isSyncing = useSelector(isSynchronizingHistorySelector)
  const lastSyncError = useSelector(lastHistorySyncErrorSelector)
  const isOnline = useSelector(isOnlineSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const routes = useNavigationState((state) => state.routes)
  const walletMeta = useSelector(walletMetaSelector)
  const isFetchingAccountState = useSelector(isFetchingAccountStateSelector)
  const walletIsInitialized = useSelector(walletIsInitializedSelector)
  
  const assetMetaData = availableAssets[tokenBalance.getDefaultId()]

  const [showWarning, setShowWarning] = useState<boolean>(isByron(walletMeta.walletImplementationId))
 
  // InsufficientFundsModal (Catalyst)
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState<boolean>(false)
  const canVote = isHaskellShelley(walletMeta.walletImplementationId)
  const [showCatalystBanner, setShowCatalystBanner] = useState<boolean>(canVote)

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

  useEffect(
    () =>
      // TODO: move this to dashboard once it's set as default screen
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

  if (!walletIsInitialized) {
    return <Text>l10n Please wait while wallet is initialized...</Text>
  }

  return (
    <SafeAreaView style={styles.scrollView}>
      <StatusBar type="light" />

      <View style={styles.container}>
        <OfflineBanner />
        <SyncErrorBanner showRefresh={!isSyncing} isOpen={isOnline && lastSyncError} />

        <WalletHero
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

type FundInfo = {
  registrationStart: string,
  registrationEnd: string,
}

export default TxHistory
