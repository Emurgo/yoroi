// @flow
import React from 'react'
import {View, ScrollView} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'

import {easyConfirmationSelector} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {NUMBERS, CONFIG, CARDANO_CONFIG} from '../../config'
import {Button, ValidatedTextInput, Text, PleaseWaitModal} from '../UiKit'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {formatAdaWithText, formatAda} from '../../utils/format'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {
  showErrorDialog,
  handleGeneralError,
  submitShelleyTx,
} from '../../actions'
import {
  SEND_ROUTES,
  WALLET_INIT_ROUTES,
  STAKING_CENTER_ROUTES,
  SHELLEY_WALLET_ROUTES,
} from '../../RoutesList'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import walletManager, {SystemAuthDisabled} from '../../crypto/wallet'
import KeyStore from '../../crypto/KeyStore'

import styles from './styles/DelegationConfirmation.style'

import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.confirmDelegation.title',
    defaultMessage: '!!!Confirm delegation',
  },
  delegateButtonLabel: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  password: {
    // TODO: add to global messages
    id: 'components.send.confirmscreen.password',
    defaultMessage: '!!!Spending password',
    description: 'some desc',
  },
  amountLabel: {
    // TODO: add to global messages
    id: 'components.send.amountfield.label',
    defaultMessage: '!!!Amount',
    description: 'some desc',
  },
  ofFees: {
    id: 'components.stakingcenter.confirmDelegation.ofFees',
    defaultMessage: '!!!of fees',
  },
  rewardsExplanation: {
    id: 'components.stakingcenter.confirmDelegation.rewardsExplanation',
    defaultMessage:
      '!!!Current approximation of rewards that you will ' +
      'receive per epoch:',
  },
  // TODO: add to global messages
  sendingModalTitle: {
    id: 'components.send.confirmscreen.sendingModalTitle',
    defaultMessage: '!!!Submitting transaction',
    description: 'some desc',
  },
  delegationTxSignError: {
    id: 'components.stakingcenter.delegationTxSignError',
    defaultMessage: '!!!Error while signing delegation transaction',
  },
})

/**
 * returns approximate rewards per epoch in lovelaces
 */
const approximateReward = (amount: BigNumber): BigNumber => {
  // TODO: based on https://staking.cardano.org/en/calculator/
  // needs to be update per-network
  const rewardMultiplier = (number) =>
    number
      .times(CARDANO_CONFIG.SHELLEY.EPOCH_REWARD)
      .div(NUMBERS.EPOCH_REWARD_DENOMINATOR)
      .div(100)

  const result = rewardMultiplier(amount)
  return result
}

const handleOnConfirm = async (
  navigation,
  isEasyConfirmationEnabled,
  password,
  submitShelleyTx,
  setSendingTransaction,
  intl,
) => {
  const delegationTxData = navigation.getParam('delegationTxData')

  const signAndSubmitTx = async (decryptedKey) => {
    try {
      const signedTx = await walletManager.signDelegationTx(
        delegationTxData.unsignedTx,
        decryptedKey,
      )
      setSendingTransaction(true)
      await submitShelleyTx(signedTx.encodedTx)
      navigation.navigate(SHELLEY_WALLET_ROUTES.DELEGATION_SUMMARY)
    } catch (e) {
      if (e instanceof NetworkError) {
        await showErrorDialog(errorMessages.networkError, intl)
      } else if (e instanceof ApiError) {
        await showErrorDialog(errorMessages.apiError, intl)
      } else {
        await handleGeneralError(
          intl.formatMessage(messages.delegationTxSignError),
          e,
          intl,
        )
      }
    } finally {
      setSendingTransaction(false)
    }
  }

  if (isEasyConfirmationEnabled) {
    try {
      await walletManager.ensureKeysValidity()
      navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
        keyId: walletManager._id,
        onSuccess: (decryptedKey) => {
          navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM)

          signAndSubmitTx(decryptedKey)
        },
        onFail: () => navigation.goBack(),
      })
    } catch (e) {
      if (e instanceof SystemAuthDisabled) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)

        return
      } else {
        throw e
      }
    }

    return
  }

  try {
    const decryptedData = await KeyStore.getData(
      walletManager._id,
      'MASTER_PASSWORD',
      '',
      password,
      intl,
    )

    signAndSubmitTx(decryptedData)
  } catch (e) {
    if (e instanceof WrongPassword) {
      await showErrorDialog(errorMessages.incorrectPassword, intl)
    } else {
      handleGeneralError('Could not submit transaction', e, intl)
    }
  }
}

const DelegationConfirmation = ({
  intl,
  navigation,
  onDelegate,
  isEasyConfirmationEnabled,
  password,
  setPassword,
  sendingTransaction,
  doNothing,
}) => {
  const poolHash = navigation.getParam('poolHash')
  const poolName = navigation.getParam('poolName')
  const amountToDelegate = navigation.getParam('amountToDelegate')
  const transactionFee = navigation.getParam('transactionFee')
  const reward = approximateReward(amountToDelegate)

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(globalMessages.stakePoolName)}
          </Text>
          <Text>{poolName}</Text>
        </View>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(globalMessages.stakePoolHash)}
          </Text>
          <Text>{poolHash}</Text>
        </View>
        <View style={styles.input}>
          <Text small style={styles.fees}>
            {'+ '}
            {formatAda(transactionFee)}
            {` ${intl.formatMessage(messages.ofFees)}`}
          </Text>
          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={doNothing}
            editable={false}
            value={formatAda(amountToDelegate)}
            label={intl.formatMessage(messages.amountLabel)}
          />
        </View>
        {!isEasyConfirmationEnabled && (
          <View style={styles.input}>
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={intl.formatMessage(messages.password)}
              onChangeText={setPassword}
            />
          </View>
        )}
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(messages.rewardsExplanation)}
          </Text>
          <Text style={styles.rewards}>{formatAdaWithText(reward)}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBlock}>
        <Button
          block
          shelleyTheme
          onPress={onDelegate}
          title={intl.formatMessage(messages.delegateButtonLabel)}
          disabled={isConfirmationDisabled}
        />
      </View>

      <PleaseWaitModal
        title={intl.formatMessage(messages.sendingModalTitle)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={sendingTransaction}
      />
    </View>
  )
}

type ExternalProps = {|
  intl: IntlShape,
  navigation: Navigation,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
      }),
      {
        submitShelleyTx,
      },
    ),
    withStateHandlers(
      {
        password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
        sendingTransaction: false,
      },
      {
        doNothing: () => () => ({}),
        setPassword: (state) => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
      },
    ),
    withHandlers({
      onDelegate: ignoreConcurrentAsyncHandler(
        ({
          navigation,
          isEasyConfirmationEnabled,
          password,
          submitShelleyTx,
          setSendingTransaction,
          intl,
        }) => async (event) => {
          await handleOnConfirm(
            navigation,
            isEasyConfirmationEnabled,
            password,
            submitShelleyTx,
            setSendingTransaction,
            intl,
          )
        },
        1000,
      ),
    }),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(DelegationConfirmation): ComponentType<ExternalProps>),
)
