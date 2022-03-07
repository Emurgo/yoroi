import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {WebView} from 'react-native-webview'
import {useSelector} from 'react-redux'

import {showErrorDialog} from '../../../legacy/actions'
import {ApiError, NetworkError} from '../../../legacy/api/errors'
import type {RawUtxo} from '../../../legacy/api/types'
import AccountAutoRefresher from '../../../legacy/components/Delegation/AccountAutoRefresher'
import UtxoAutoRefresher from '../../../legacy/components/Send/UtxoAutoRefresher'
import {CONFIG, getTestStakingPool, isNightly, SHOW_PROD_POOLS_IN_DEV} from '../../../legacy/config/config'
import {getNetworkConfigById} from '../../../legacy/config/networks'
import {InsufficientFunds} from '../../../legacy/crypto/errors'
import walletManager from '../../../legacy/crypto/walletManager'
import globalMessages, {errorMessages} from '../../../legacy/i18n/global-messages'
import {STAKING_CENTER_ROUTES} from '../../../legacy/RoutesList'
import {
  accountBalanceSelector,
  defaultNetworkAssetSelector,
  languageSelector,
  poolOperatorSelector,
  serverStatusSelector,
  utxosSelector,
} from '../../../legacy/selectors'
import type {ServerStatusCache} from '../../../legacy/state'
import type {DefaultAsset} from '../../../legacy/types/HistoryTransaction'
import {ObjectValues} from '../../../legacy/utils/flow'
import {normalizeTokenAmount} from '../../../legacy/utils/format'
import {Logger} from '../../../legacy/utils/logging'
import {PleaseWaitModal} from '../../components'
import {useSelectedWallet} from '../../SelectedWallet'
import {PoolDetailScreen} from '../PoolDetails'
import {PoolWarningModal} from '../PoolWarningModal'

export const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const [amountToDelegate, setAmountToDelegate] = useState<string | null>(null)
  const [selectedPools, setSelectedPools] = useState<Array<SelectedPool>>([])
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
  const config = getNetworkConfigById(wallet.networkId)
  const isMainnet = config.IS_MAINNET
  const nightlyAndDevPoolHashes = getTestStakingPool(wallet.networkId, wallet.provider)

  // pools user is currently delegating to
  const poolList = poolOperator != null ? [poolOperator] : null

  const handleOnPress = (poolHash?: string) => {
    const selectedPoolHashes = poolHash ? [poolHash] : nightlyAndDevPoolHashes
    Logger.debug('manual inputted or config pool:', selectedPoolHashes)
    _delegate(selectedPoolHashes)
  }

  const handleOnMessage = async (event) => {
    if (event) {
      const selectedPoolHashes: Array<string> = JSON.parse(decodeURI(event.nativeEvent.data))
      Logger.debug('selected pools from explorer:', selectedPoolHashes)
      _delegate(selectedPoolHashes)
    }
  }

  const _delegate = async (selectedPoolHashes: Array<string> = []) => {
    try {
      setBusy(true)

      if (selectedPoolHashes.length) {
        await _handleSelectedPoolHashes(
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
      {(__DEV__ || (isNightly() && !isMainnet)) && (
        <View style={styles.container}>
          <PoolDetailScreen
            onPressDelegate={(poolHash) => handleOnPress(poolHash)}
            disabled={!nightlyAndDevPoolHashes.length}
          />
        </View>
      )}
      {(isMainnet || SHOW_PROD_POOLS_IN_DEV) && (
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

type SelectedPool = {
  poolName?: string
  poolHash: string
}

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
  accountBalance: BigNumber | undefined | null,
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
        message: (e as Error).message,
      })
    }
  }
}

const _handleSelectedPoolHashes = async (
  selectedPoolHashes: Array<string>,
  setSelectedPools: (selectedPools: Array<SelectedPool>) => void,
  setReputationInfo: (reputationInfo: Record<string, unknown>) => void,
  setShowPoolWarning: (showPoolWarning: boolean) => void,
  accountBalance: BigNumber | undefined | null,
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
    const poolsReputation: {[key: string]: SelectedPool} = {}

    if (poolInfo && poolInfo.info != null) {
      const selectedPools: Array<SelectedPool> = [
        {
          poolName: poolInfo.info.name,
          poolHash: selectedPoolHashes[0],
        },
      ]
      setSelectedPools(selectedPools)

      // check if pool in blacklist
      const poolsInBlackList: Array<string> = []
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
        message: (e as Error).message,
      })
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
