// @flow
import React, {useState, useEffect} from 'react'
import {View} from 'react-native'
import {WebView} from 'react-native-webview'
import {BigNumber} from 'bignumber.js'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {injectIntl, defineMessages} from 'react-intl'

import {STAKING_CENTER_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config/config'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Logger} from '../../utils/logging'
import {formatTokenInteger} from '../../utils/format'
import walletManager from '../../crypto/walletManager'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../actions'
import {PleaseWaitModal} from '../UiKit'
import PoolWarningModal from './PoolWarningModal'
import {ObjectValues} from '../../utils/flow'
import {
  isOnlineSelector,
  utxosSelector,
  accountBalanceSelector,
  defaultNetworkAssetSelector,
  poolOperatorSelector,
  languageSelector,
  serverStatusSelector,
} from '../../selectors'
import UtxoAutoRefresher from '../Send/UtxoAutoRefresher'
import AccountAutoRefresher from './AccountAutoRefresher'
import {NetworkError, ApiError} from '../../api/errors'
import {InsufficientFunds} from '../../crypto/errors'

import styles from './styles/DelegationCenter.style'

import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {DefaultAsset} from '../../types/HistoryTransaction'
import type {Navigation} from '../../types/navigation'
import type {RawUtxo} from '../../api/types'
import type {ServerStatusCache} from '../../state'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
  delegationTxBuildError: {
    id: 'components.stakingcenter.delegationTxBuildError',
    defaultMessage: '!!!Error while building delegation transaction',
  },
})

const noPoolDataDialog = defineMessages({
  title: {
    id: 'components.stakingcenter.noPoolDataDialog.title',
    defaultMessage: '!!!Invalid Pool Data',
  },
  message: {
    id: 'components.stakingcenter.noPoolDataDialog.message',
    defaultMessage:
      '!!!The data from the stake pool(s) you selected is invalid. Please try again',
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
const prepareStakingURL = (
  poolList: ?Array<string>,
  amountToDelegate: ?string,
  locale: string,
): string => {
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
  navigation: Navigation,
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
  utxos,
  defaultAsset,
  intl: IntlShape,
  navigation: Navigation,
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

const StakingCenter = ({
  intl,
  navigation,
  poolOperator,
  utxos,
  defaultAsset,
  languageCode,
  accountBalance,
  serverStatus,
}) => {
  // pools user is currently delegating to
  const poolList = poolOperator != null ? [poolOperator] : null

  const [amountToDelegate, setAmountToDelegate] = useState(null)

  const getAmountToDelegate = async () => {
    const utxosForKey =
      utxos != null ? await walletManager.getAllUtxosForKey(utxos) : null
    // prettier-ignore
    const amountToDelegate =
      utxosForKey != null
        ? utxosForKey
          .map((utxo) => utxo.amount)
          .reduce(
            (x: BigNumber, y) => x.plus(new BigNumber(y || 0)),
            new BigNumber(0),
          )
        : BigNumber(0)
    setAmountToDelegate(formatTokenInteger(amountToDelegate, defaultAsset))
  }

  const [selectedPools, setSelectedPools] = useState([])

  const [reputationInfo, setReputationInfo] = useState({})

  const [showPoolWarning, setShowPoolWarning] = useState(false)

  const [busy, setBusy] = useState(false)

  const handleOnMessage = async (event) => {
    try {
      setBusy(true)
      const selectedPoolHashes: Array<string> = JSON.parse(
        decodeURI(event.nativeEvent.data),
      )
      Logger.debug('selected pools from explorer:', selectedPoolHashes)
      await _handleOnMessage(
        selectedPoolHashes,
        setSelectedPools,
        setReputationInfo,
        setShowPoolWarning,
        accountBalance,
        utxos,
        defaultAsset,
        intl,
        navigation,
        serverStatus,
      )
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    getAmountToDelegate()
  })

  return (
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
            utxos,
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
      <PleaseWaitModal
        title={''}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={busy}
      />
    </>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    connect((state) => ({
      utxos: utxosSelector(state),
      accountBalance: accountBalanceSelector(state),
      isOnline: isOnlineSelector(state),
      defaultAsset: defaultNetworkAssetSelector(state),
      poolOperator: poolOperatorSelector(state),
      languageCode: languageSelector(state),
      serverStatus: serverStatusSelector(state),
    })),
  )(StakingCenter): ComponentType<ExternalProps>),
)
