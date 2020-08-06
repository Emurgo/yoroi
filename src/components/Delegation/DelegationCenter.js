// @flow
import React from 'react'
import {View} from 'react-native'
import {WebView} from 'react-native-webview'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {STAKING_CENTER_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {CONFIG} from '../../config/config'
import {Logger} from '../../utils/logging'
import walletManager from '../../crypto/walletManager'
import {getShelleyTxFee} from '../../crypto/jormungandr/transactions/utils'
import {InsufficientFunds} from '../../crypto/errors'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {handleGeneralError, showErrorDialog} from '../../actions'
import {NetworkError, ApiError} from '../../api/errors'
import {PleaseWaitModal} from '../UiKit'
import PoolWarningModal from './PoolWarningModal'

import styles from './styles/DelegationCenter.style'

import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

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

/**
 * Prepares WebView's target staking URI
 * @param {*} userAda : needs to be in ADA (not Lovelaces) as per Seiza API
 * @param {*} poolList : Array of delegated pool hash
 */
const prepareStakingURL = (
  userAda: string,
  poolList: Array<string>,
): null | string => {
  // eslint-disable-next-line max-len
  // Refer: https://github.com/Emurgo/yoroi-frontend/blob/2f06f7afa5283365f1070b6a042bcfedba51646f/app/containers/wallet/staking/StakingPage.js#L60
  // source=mobile is constant and already included
  // TODO: add locale parameter
  let finalURL = CONFIG.NETWORKS.JORMUNGANDR.SEIZA_STAKING_SIMPLE(userAda)
  if (poolList != null) {
    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`
  }
  return finalURL
}

const DelegationCenter = ({
  navigation,
  intl,
  handleOnMessage,
  navigateToDelegationConfirm,
  busy,
  showPoolWarning,
  setShowPoolWarning,
  selectedPools,
  reputationInfo,
}) => {
  const approxAdaToDelegate = navigation.getParam('approxAdaToDelegate')
  const poolList = navigation.getParam('pools')
  return (
    <>
      <View style={styles.container}>
        <WebView
          source={{uri: prepareStakingURL(approxAdaToDelegate, poolList)}}
          onMessage={(event) => handleOnMessage(event)}
        />
      </View>
      <PoolWarningModal
        visible={showPoolWarning}
        onPress={() => {
          setShowPoolWarning(false)
          navigateToDelegationConfirm(selectedPools)
        }}
        onRequestClose={() => {
          setShowPoolWarning(false)
          navigateToDelegationConfirm(selectedPools)
        }}
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

type SelectedPool = {|
  +name: null | string,
  +poolHash: string,
|}

type ExternalProps = {|
  navigation: Navigation,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withStateHandlers(
      {
        busy: false,
        showPoolWarning: false,
        reputationInfo: {},
        selectedPools: [],
      },
      {
        setBusy: () => (busy) => ({busy}),
        setShowPoolWarning: () => (showPoolWarning) => ({showPoolWarning}),
        setReputationInfo: () => (reputationInfo) => ({reputationInfo}),
        setSelectedPools: () => (selectedPools) => ({selectedPools}),
      },
    ),
    withHandlers({
      withPleaseWaitModal: ({setBusy}) => async (
        func: () => Promise<void>,
      ): Promise<void> => {
        setBusy(true)
        try {
          await func()
        } finally {
          setBusy(false)
        }
      },
    }),
    withHandlers({
      navigateToDelegationConfirm: ({
        intl,
        navigation,
        withPleaseWaitModal,
      }) => async (selectedPools) => {
        await withPleaseWaitModal(async () => {
          try {
            const utxos = navigation.getParam('utxos')
            const valueInAccount = navigation.getParam('valueInAccount')
            const delegationTxData = await walletManager.prepareDelegationTx(
              {id: selectedPools[0].poolHash},
              valueInAccount.toNumber(),
              utxos,
            )
            const fee = await getShelleyTxFee(delegationTxData.unsignedTx.IOs)
            navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM, {
              poolName: selectedPools[0].name,
              poolHash: selectedPools[0].poolHash,
              amountToDelegate: delegationTxData.totalAmountToDelegate,
              transactionFee: fee,
              delegationTxData,
            })
          } catch (e) {
            if (e instanceof InsufficientFunds) {
              await showErrorDialog(errorMessages.insufficientBalance, intl)
            } else if (e instanceof NetworkError) {
              await showErrorDialog(errorMessages.networkError, intl)
            } else if (e instanceof ApiError) {
              await showErrorDialog(errorMessages.apiError, intl)
            } else {
              await handleGeneralError(
                intl.formatMessage(messages.delegationTxBuildError),
                e,
                intl,
              )
            }
          }
        })
      },
    }),
    withHandlers({
      handleOnMessage: ({
        navigation,
        navigateToDelegationConfirm,
        setReputationInfo,
        setSelectedPools,
        setShowPoolWarning,
        intl,
      }) => async (event) => {
        const selectedPools: Array<SelectedPool> = JSON.parse(
          decodeURI(event.nativeEvent.data),
        )
        const poolsReputation = navigation.getParam('poolsReputation')
        Logger.debug(`From Seiza: ${JSON.stringify(selectedPools)}`)
        if (
          selectedPools &&
          selectedPools.length >= 1 &&
          selectedPools[0].poolHash != null
        ) {
          setSelectedPools(selectedPools)
          // check if pool in blacklist
          const poolsInBlackList = []
          for (const pool of selectedPools) {
            if (pool.poolHash in poolsReputation) {
              poolsInBlackList.push(pool.poolHash)
            }
          }
          if (poolsInBlackList.length > 0) {
            setReputationInfo(poolsReputation[poolsInBlackList[0]])
            setShowPoolWarning(true)
          } else {
            navigateToDelegationConfirm(selectedPools)
          }
        } else {
          await showErrorDialog(noPoolDataDialog, intl)
        }
      },
    }),
  )(DelegationCenter): ComponentType<ExternalProps>),
)
