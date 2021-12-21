import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, RefreshControl, ScrollView, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useQuery} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {submitSignedTx, submitTransaction} from '../../legacy/actions'
import {fetchAccountState} from '../../legacy/actions/account'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../legacy/actions/hwWallet'
import {fetchUTXOs} from '../../legacy/actions/utxo'
import AccountAutoRefresher from '../../legacy/components/Delegation/AccountAutoRefresher'
import {
  DelegatedStakepoolInfo,
  EpochProgress,
  NotDelegatedInfo,
  UserSummary,
} from '../../legacy/components/Delegation/dashboard'
import DelegationNavigationButtons from '../../legacy/components/Delegation/DelegationNavigationButtons'
import styles from '../../legacy/components/Delegation/styles/DelegationSummary.style'
import UtxoAutoRefresher from '../../legacy/components/Send/UtxoAutoRefresher'
import {Banner, OfflineBanner, StatusBar} from '../../legacy/components/UiKit'
import {getCardanoBaseConfig} from '../../legacy/config/config'
import {getCardanoNetworkConfigById} from '../../legacy/config/networks'
import globalMessages from '../../legacy/i18n/global-messages'
import {CATALYST_ROUTES, DELEGATION_ROUTES} from '../../legacy/RoutesList'
import {
  accountBalanceSelector,
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isDelegatingSelector,
  isFetchingAccountStateSelector,
  isFetchingUtxosSelector,
  isHWSelector,
  isOnlineSelector,
  isReadOnlySelector,
  lastAccountStateFetchErrorSelector,
  poolOperatorSelector,
  serverStatusSelector,
  totalDelegatedSelector,
  utxoBalanceSelector,
  utxosSelector,
} from '../../legacy/selectors'
import {
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
  genToRelativeSlotNumber,
} from '../../legacy/utils/timeUtils'
import {VotingBanner} from '../Catalyst/VotingBanner'
import {useSelectedWallet} from '../SelectedWallet'
import {RemotePoolMetaFailure, RemotePoolMetaSuccess, WalletInterface} from '../types'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

export const Dashboard = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const utxoBalance = useSelector(utxoBalanceSelector)
  const utxos = useSelector(utxosSelector)
  const isFetchingUtxos = useSelector(isFetchingUtxosSelector)
  const accountBalance = useSelector(accountBalanceSelector)
  const isDelegating = useSelector(isDelegatingSelector)
  const isFetchingAccountState = useSelector(isFetchingAccountStateSelector)
  const lastAccountStateSyncError = useSelector(lastAccountStateFetchErrorSelector)
  const totalDelegated = useSelector(totalDelegatedSelector)
  const isOnline = useSelector(isOnlineSelector)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const isHW = useSelector(isHWSelector)
  const isReadOnly = useSelector(isReadOnlySelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const serverStatus = useSelector(serverStatusSelector)
  const wallet = useSelectedWallet()

  const [showWithdrawalDialog, setShowWithdrawalDialog] = React.useState(false)

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />
      <UtxoAutoRefresher />
      <AccountAutoRefresher wallet={wallet} />

      <View style={styles.container}>
        <OfflineBanner />
        {isOnline && lastAccountStateSyncError && (
          <SyncErrorBanner showRefresh={!(isFetchingAccountState || isFetchingUtxos)} />
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                fetchUTXOs()
                fetchAccountState(wallet)
              }}
              refreshing={false}
            />
          }
        >
          {!isDelegating && <NotDelegatedInfo />}

          <View style={styles.row}>
            <EpochInfo />
          </View>

          <View style={styles.row}>
            <UserSummary
              totalAdaSum={utxoBalance}
              totalRewards={accountBalance}
              totalDelegated={totalDelegated}
              onWithdraw={() => setShowWithdrawalDialog(true)}
              disableWithdraw={isReadOnly}
            />
          </View>

          <VotingBanner onPress={() => navigation.navigate(CATALYST_ROUTES.ROOT)} disabled={false} />

          {isDelegating && <StakingInfo />}
        </ScrollView>

        <DelegationNavigationButtons
          onPress={() => navigation.navigate(DELEGATION_ROUTES.STAKING_CENTER)}
          disabled={isReadOnly}
        />
      </View>

      {showWithdrawalDialog && (
        <WithdrawStakingRewards
          intl={intl}
          navigation={navigation}
          utxos={utxos}
          isEasyConfirmationEnabled={isEasyConfirmationEnabled}
          isHW={isHW}
          hwDeviceInfo={hwDeviceInfo}
          defaultAsset={defaultAsset}
          serverStatus={serverStatus}
          setLedgerDeviceId={() => dispatch(setLedgerDeviceId())}
          setLedgerDeviceObj={() => dispatch(setLedgerDeviceObj())}
          submitTransaction={() => dispatch(submitTransaction())}
          submitSignedTx={() => dispatch(submitSignedTx())}
          onDone={() => setShowWithdrawalDialog(false)}
        />
      )}
    </SafeAreaView>
  )
}

const SyncErrorBanner = ({showRefresh}: Record<string, unknown> /* TODO: type */) => {
  const intl = useIntl()

  return (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
      }
    />
  )
}

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => clearInterval(id)
  }, [])

  return currentTime
}

const EpochInfo = () => {
  const currentTime = useCurrentTime()
  const wallet = useSelectedWallet()
  const config = getCardanoBaseConfig(getCardanoNetworkConfigById(wallet.networkId, wallet.provider))

  const toRelativeSlotNumberFn = genToRelativeSlotNumber(config)
  const timeToSlotFn = genTimeToSlot(config)

  const currentAbsoluteSlot = timeToSlotFn({
    time: currentTime,
  })

  const currentRelativeTime = toRelativeSlotNumberFn(
    timeToSlotFn({
      time: new Date(),
    }).slot,
  )
  const epochLength = genCurrentEpochLength(config)()
  const slotLength = genCurrentSlotLength(config)()

  const secondsLeftInEpoch = (epochLength - currentRelativeTime.slot) * slotLength
  const timeLeftInEpoch = new Date(1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot)

  const leftPadDate = (num: number) => {
    if (num < 10) return `0${num}`
    return num.toString()
  }

  return (
    <EpochProgress
      percentage={Math.floor((100 * currentRelativeTime.slot) / epochLength)}
      currentEpoch={currentRelativeTime.epoch}
      endTime={{
        d: leftPadDate(Math.floor(secondsLeftInEpoch / (3600 * 24))),
        h: leftPadDate(timeLeftInEpoch.getUTCHours()),
        m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
        s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
      }}
    />
  )
}

const StakingInfo = () => {
  const wallet = useSelectedWallet()
  const poolOperator = useSelector(poolOperatorSelector)
  const {poolInfos, isLoading} = usePoolInfos(wallet, poolOperator)

  return (
    <View style={styles.row}>
      {poolInfos ? (
        Object.entries(poolInfos).map(([poolOperator, poolInfo]) =>
          isRemotePoolMetaFailure(poolInfo) ? (
            <PoolInfoError />
          ) : (
            <PoolInfo poolInfo={poolInfo} poolOperator={poolOperator} />
          ),
        )
      ) : isLoading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size={'large'} color={'black'} />
        </View>
      ) : null}
    </View>
  )
}

const PoolInfo = ({poolInfo, poolOperator}: {poolInfo: RemotePoolMetaSuccess; poolOperator: string}) => {
  return (
    <DelegatedStakepoolInfo
      poolTicker={poolInfo.info?.ticker}
      poolName={poolInfo.info?.name}
      poolHash={poolOperator != null ? poolOperator : ''}
      poolURL={poolInfo.info?.homepage}
    />
  )
}
const PoolInfoError = () => {
  return null
}

const usePoolInfos = (wallet: WalletInterface, poolOperator: string | null) => {
  const query = useQuery({
    queryKey: [wallet.id, 'poolInfo', poolOperator],
    queryFn: async () => {
      if (!poolOperator) {
        throw new Error('Invalid Pool Operator')
      }
      return wallet.fetchPoolInfo({poolIds: [poolOperator]})
    },
    enabled: !!poolOperator,
  })

  return {poolInfos: query.data, ...query}
}

const isRemotePoolMetaFailure = (
  poolResponse: RemotePoolMetaSuccess | RemotePoolMetaFailure,
): poolResponse is RemotePoolMetaFailure => 'error' in poolResponse
