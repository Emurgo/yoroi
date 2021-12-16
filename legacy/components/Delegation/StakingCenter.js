// @flow

import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {WebView} from 'react-native-webview'
import {useSelector} from 'react-redux'

// $FlowExpectedError
import {useSelectedWallet} from '../../../src/SelectedWallet'
import {showErrorDialog} from '../../actions'
import {ApiError, NetworkError} from '../../api/errors'
import type {RawUtxo} from '../../api/types'
import {CONFIG, getTestStakingPool, isNightly, SHOW_PROD_POOLS_IN_DEV} from '../../config/config'
import {InsufficientFunds} from '../../crypto/errors'
import walletManager from '../../crypto/walletManager'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {STAKING_CENTER_ROUTES} from '../../RoutesList'
import {
  accountBalanceSelector,
  defaultNetworkAssetSelector,
  languageSelector,
  poolOperatorSelector,
  serverStatusSelector,
  utxosSelector,
} from '../../selectors'
import type {ServerStatusCache} from '../../state'
import type {DefaultAsset} from '../../types/HistoryTransaction'
import {ObjectValues} from '../../utils/flow'
import {normalizeTokenAmount} from '../../utils/format'
import {Logger} from '../../utils/logging'
import UtxoAutoRefresher from '../Send/UtxoAutoRefresher'
import {PleaseWaitModal} from '../UiKit'
import AccountAutoRefresher from './AccountAutoRefresher'
import PoolDetailScreen from './PoolDetailScreen'
import PoolWarningModal from './PoolWarningModal'
import styles from './styles/DelegationCenter.style'

const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const [amountToDelegate, setAmountToDelegate] = useState<string | null>(null)
  const [selectedPools, setSelectedPools] = useState([])
  const [reputationInfo, setReputationInfo] = useState({})
  const [showPoolWarning, setShowPoolWarning] = useState(false)
  const [busy, setBusy] = useState(false)

  const utxos = useSelector(utxosSelector)
  const accountBalance = useSelector(accountBalanceSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const poolOperator = useSelector(poolOperatorSelector)
  const languageCode = useSelector(languageSelector)
  const serverStatus = useSelector(serverStatusSelector)
  const wallet = useSelectedWallet()

  const nightlyAndDevPoolHashes = getTestStakingPool(wallet.networkId, wallet.provider)

  // pools user is currently delegating to
  const poolList = poolOperator != null ? [poolOperator] : null

  const handleOnMessage = async (event) => {
    const selectedPoolHashes: Array<string> = !event
      ? nightlyAndDevPoolHashes
      : JSON.parse(decodeURI(event.nativeEvent.data))

    try {
      setBusy(true)

      if (selectedPoolHashes.length) {
        Logger.debug('selected pools from explorer:', selectedPoolHashes)

        await _handleOnMessage(
          selectedPoolHashes,
          setSelectedPools,
          setReputationInfo,
          setShowPoolWarning,
          accountBalance,
          utxos || [],
          defaultAsset,
          intl,
          navigation,
          serverStatus,
        )
      } else {
        await showErrorDialog(noPoolDataDialog, intl)
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(
    () => {
      const getAmountToDelegate: () => Promise<void> = async () => {
        if (utxos != null) {
          const utxosForKey = await walletManager.getAllUtxosForKey(utxos)
          const _amountToDelegate = utxosForKey
            .map((utxo) => utxo.amount)
            .reduce((x: BigNumber, y) => x.plus(new BigNumber(y || 0)), new BigNumber(0))
          setAmountToDelegate(normalizeTokenAmount(_amountToDelegate, defaultAsset).toString())
        }
      }

      getAmountToDelegate()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [utxos],
  )

  return (
    <>
      {IS_STAKING_ON_TEST_BUILD && (
        <View style={styles.container}>
          <PoolDetailScreen onPressDelegate={() => handleOnMessage()} disabled={!nightlyAndDevPoolHashes.length} />
        </View>
      )}
      {(!IS_STAKING_ON_TEST_BUILD || SHOW_PROD_POOLS_IN_DEV) && (
        <>
          <View style={styles.container}>
            <UtxoAutoRefresher />
            <AccountAutoRefresher />
            <WebView
              source={{
                uri: prepareStakingURL(poolList, amountToDelegate, languageCode),
              }}
              onMessage={(event) => handleOnMessage(event)}
            />
          </View>
          <PoolWarningModal
            visible={showPoolWarning}
            onPress={async () => {
              setShowPoolWarning(false)
              await navigateToDelegationConfirm(
                accountBalance,
                utxos || [],
                selectedPools,
                defaultAsset,
                intl,
                navigation,
                serverStatus,
              )
            }}
            onRequestClose={() => setShowPoolWarning(false)}
            reputationInfo={reputationInfo}
          />
          <PleaseWaitModal title={''} spinnerText={intl.formatMessage(globalMessages.pleaseWait)} visible={busy} />
        </>
      )}
    </>
  )
}

export default StakingCenter

const IS_STAKING_ON_TEST_BUILD = isNightly() || CONFIG.IS_TESTNET_BUILD

const noPoolDataDialog = defineMessages({
  title: {
    id: 'components.stakingcenter.noPoolDataDialog.title',
    defaultMessage: '!!!Invalid Pool Data',
  },
  message: {
    id: 'components.stakingcenter.noPoolDataDialog.message',
    defaultMessage: '!!!The data from the stake pool(s) you selected is invalid. Please try again',
  },
})

type SelectedPool = {|
  +poolName: ?string,
  +poolHash: string,
|}

/**
 * Prepares WebView's target staking URI
 * @param {*} poolList : Array of delegated pool hash
 */
const prepareStakingURL = (poolList: Array<string> | null, amountToDelegate: string | null, locale: string): string => {
  // source=mobile is constant and already included
  let finalURL = CONFIG.NETWORKS.HASKELL_SHELLEY.POOL_EXPLORER

  const lang = locale.slice(0, 2)
  finalURL += `&lang=${lang}`

  if (poolList != null) {
    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`
  }
  if (amountToDelegate != null) {
    finalURL += `&totalAda=${amountToDelegate}`
  }
  return finalURL
}

const navigateToDelegationConfirm = async (
  accountBalance: ?BigNumber,
  utxos: Array<RawUtxo>,
  selectedPools: Array<SelectedPool>,
  defaultAsset: DefaultAsset,
  intl: IntlShape,
  navigation,
  serverStatus: ServerStatusCache,
) => {
  try {
    const selectedPool = selectedPools[0]
    if (accountBalance == null) return
    const transactionData = await walletManager.createDelegationTx(
      selectedPool.poolHash,
      accountBalance,
      utxos,
      defaultAsset,
      serverStatus.serverTime,
    )
    const transactionFee = await transactionData.signRequest.fee()
    navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM, {
      poolName: selectedPool.poolName,
      poolHash: selectedPool.poolHash,
      transactionData,
      transactionFee,
    })
  } catch (e) {
    if (e instanceof InsufficientFunds) {
      await showErrorDialog(errorMessages.insufficientBalance, intl)
    } else {
      Logger.error(e)
      await showErrorDialog(errorMessages.generalError, intl, {
        message: e.message,
      })
    }
  }
}

const _handleOnMessage = async (
  selectedPoolHashes: Array<string>,
  setSelectedPools: (selectedPools: Array<SelectedPool>) => void,
  setReputationInfo: (reputationInfo: Object) => void,
  setShowPoolWarning: (showPoolWarning: boolean) => void,
  accountBalance: ?BigNumber,
  utxos: Array<RawUtxo>,
  defaultAsset,
  intl: IntlShape,
  navigation,
  serverStatus: ServerStatusCache,
) => {
  try {
    const poolInfoResponse = await walletManager.fetchPoolInfo({
      poolIds: selectedPoolHashes,
    })
    const poolInfo = ObjectValues(poolInfoResponse)[0]
    Logger.debug('StakingCenter::poolInfo', poolInfo)

    // TODO: fetch reputation info once an endpoint is implemented
    const poolsReputation: {[key: string]: mixed} = {}

    if (poolInfo.info != null) {
      const selectedPools: Array<SelectedPool> = [
        {
          poolName: poolInfo.info.name,
          poolHash: selectedPoolHashes[0],
        },
      ]
      setSelectedPools(selectedPools)

      // check if pool in blacklist
      const poolsInBlackList = []
      for (const pool of selectedPoolHashes) {
        if (pool in poolsReputation) {
          poolsInBlackList.push(pool)
        }
      }
      if (poolsInBlackList.length > 0) {
        setReputationInfo(poolsReputation[poolsInBlackList[0]])
        setShowPoolWarning(true)
      } else {
        await navigateToDelegationConfirm(
          accountBalance,
          utxos,
          selectedPools,
          defaultAsset,
          intl,
          navigation,
          serverStatus,
        )
      }
    } else {
      await showErrorDialog(noPoolDataDialog, intl)
    }
  } catch (e) {
    if (e instanceof NetworkError) {
      await showErrorDialog(errorMessages.networkError, intl)
    } else if (e instanceof ApiError) {
      await showErrorDialog(noPoolDataDialog, intl)
    } else {
      Logger.error(e)
      await showErrorDialog(errorMessages.generalError, intl, {
        message: e.message,
      })
    }
  }
}
