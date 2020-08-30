// @flow
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {View, StyleSheet, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {STAKING_CENTER_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Logger} from '../../utils/logging'
import walletManager from '../../crypto/walletManager'
import {confirmationMessages, errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../actions'
import {ValidatedTextInput, Button} from '../UiKit'
import {COLORS} from '../../styles/config'
import {ObjectValues} from '../../utils/flow'
import {
  isOnlineSelector,
  utxosSelector,
  accountBalanceSelector,
} from '../../selectors'
import UtxoAutoRefresher from '../Send/UtxoAutoRefresher'
import AccountAutoRefresher from './AccountAutoRefresher'
import {NetworkError, ApiError} from '../../api/errors'
import {InsufficientFunds} from '../../crypto/errors'

import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.delegationbyid.title',
    defaultMessage: '!!!Delegation by Id',
  },
  stakePoolId: {
    id: 'components.stakingcenter.delegationbyid.stakePoolId',
    defaultMessage: '!!!Stake pool id',
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
  },
  input: {
    lineHeight: 24,
    height: 'auto',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  actions: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
})

const StakeByIdScreen = ({
  navigation,
  intl,
  navigateToDelegationConfirm,
  busy,
  handleInputChange,
  handleOnContinue,
  poolId,
  utxos,
  errors,
}) => {
  return (
    <>
      <View style={styles.container}>
        <UtxoAutoRefresher />
        <AccountAutoRefresher />
        <ValidatedTextInput
          multiline
          style={styles.input}
          value={poolId}
          label={intl.formatMessage(messages.stakePoolId)}
          onChangeText={handleInputChange}
          blurOnSubmit
        />
        <View style={styles.actions}>
          <Button
            onPress={handleOnContinue}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.continueButton,
            )}
            disabled={!poolId || utxos == null || busy}
          />
        </View>
        {busy && <ActivityIndicator />}
      </View>
    </>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    connect((state) => ({
      utxos: utxosSelector(state),
      accountBalance: accountBalanceSelector(state),
      isOnline: isOnlineSelector(state),
    })),
    withStateHandlers(
      {
        busy: false,
        poolId: '',
      },
      {
        setBusy: () => (busy) => ({busy}),
        setPoolId: () => (poolId) => ({poolId}),
      },
    ),
    withHandlers({
      navigateToDelegationConfirm: ({
        poolId,
        navigation,
        accountBalance,
        utxos,
        intl,
      }) => async (selectedPool) => {
        try {
          const delegationTxData = await walletManager.createDelegationTx(
            poolId,
            accountBalance,
            utxos,
          )
          const _fee = await delegationTxData.signTxRequest.unsignedTx.get_fee_if_set()
          const transactionFee = new BigNumber(
            _fee != null ? await _fee.to_str() : '0',
          ).plus(
            await (await delegationTxData.signTxRequest.unsignedTx.get_deposit()).to_str(),
          )

          navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM, {
            poolName: selectedPool.poolName,
            poolHash: selectedPool.poolHash,
            transactionFee,
            delegationTxData,
          })
        } catch (e) {
          if (e instanceof InsufficientFunds) {
            await showErrorDialog(errorMessages.insufficientBalance, intl)
          } else {
            Logger.error(e)
            throw e
          }
        }
      },
    }),
    withHandlers({
      handleInputChange: ({setPoolId}) => (poolId) => setPoolId(poolId),
      handleOnContinue: ({
        navigation,
        navigateToDelegationConfirm,
        intl,
        poolId,
      }) => async (event) => {
        try {
          const poolInfoResponse = await walletManager.fetchPoolInfo({
            poolIds: [poolId],
          })
          const poolInfo = ObjectValues(poolInfoResponse)[0]
          Logger.debug('handleOnContinue::poolInfo', poolInfo)
          if (poolInfo?.info != null) {
            const selectedPool = {
              poolName: poolInfo.info.name,
              poolHash: poolId,
            }
            navigateToDelegationConfirm(selectedPool)
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
            throw e
          }
        }
      },
    }),
  )(StakeByIdScreen): ComponentType<ExternalProps>),
)
