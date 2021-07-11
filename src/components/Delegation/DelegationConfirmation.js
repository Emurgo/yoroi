// @flow
import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'
import {CommonActions} from '@react-navigation/routers'

import {
  easyConfirmationSelector,
  isHWSelector,
  hwDeviceInfoSelector,
  defaultNetworkAssetSelector,
} from '../../selectors'
import {showErrorDialog, submitTransaction, submitSignedTx} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {CONFIG} from '../../config/config'
import {
  Button,
  OfflineBanner,
  ValidatedTextInput,
  Text,
  PleaseWaitModal,
  Modal,
} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import globalMessages, {
  errorMessages,
  txLabels,
} from '../../i18n/global-messages'
import {formatTokenWithText, formatTokenAmount} from '../../utils/format'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {
  SEND_ROUTES,
  WALLET_ROOT_ROUTES,
  STAKING_CENTER_ROUTES,
  WALLET_ROUTES,
} from '../../RoutesList'
import {WrongPassword} from '../../crypto/errors'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import KeyStore from '../../crypto/KeyStore'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import HWInstructions from '../Ledger/HWInstructions'
import LocalizableError from '../../i18n/LocalizableError'
import {MultiToken} from '../../crypto/MultiToken'
import {ISignRequest} from '../../crypto/ISignRequest'

import styles from './styles/DelegationConfirmation.style'

import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'
import type {CreateDelegationTxResponse} from '../../crypto/shelley/delegationUtils'

const messages = defineMessages({
  delegateButtonLabel: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
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
})

/**
 * returns approximate rewards per epoch in lovelaces
 */
const approximateReward = (amount: BigNumber): BigNumber => {
  // TODO: based on https://staking.cardano.org/en/calculator/
  // needs to be update per-network
  const rewardMultiplier = (number) =>
    number
      .times(CONFIG.NETWORKS.HASKELL_SHELLEY.PER_EPOCH_PERCENTAGE_REWARD)
      .div(CONFIG.NUMBERS.EPOCH_REWARD_DENOMINATOR)

  const result = rewardMultiplier(amount)
  return result
}

const handleOnConfirm = async (
  navigation,
  route,
  isHW,
  isEasyConfirmationEnabled,
  password,
  submitTransaction,
  submitSignedTx,
  setSendingTransaction,
  setProcessingTx,
  intl: IntlShape,
  useUSB,
  setErrorData,
) => {
  const transactionData: CreateDelegationTxResponse =
    route.params?.transactionData
  if (transactionData == null) throw new Error('DelegationConfirmation:txData')
  const signRequest = transactionData.signRequest

  const submitTx = async <T>(
    tx: string | ISignRequest<T>,
    decryptedKey: ?string,
  ) => {
    try {
      setSendingTransaction(true)
      if (decryptedKey != null) {
        await submitTransaction(tx, decryptedKey)
      } else {
        await submitSignedTx(tx)
      }
      navigation.dispatch(
        CommonActions.reset({
          key: null,
          index: 0,
          routes: [{name: STAKING_CENTER_ROUTES.MAIN}],
        }),
      )
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    } finally {
      setSendingTransaction(false)
    }
  }

  try {
    if (isHW) {
      try {
        setProcessingTx(true)
        const signedTx = await walletManager.signTxWithLedger(
          transactionData.signRequest,
          useUSB,
        )
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
      } finally {
        setProcessingTx(false)
      }
      return
    }

    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.navigate(STAKING_CENTER_ROUTES.DELEGATION_CONFIRM)

            await submitTx(signRequest, decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

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

      await submitTx(signRequest, decryptedData)
    } catch (e) {
      if (e instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        throw e
      }
    }
  } catch (e) {
    if (e instanceof LocalizableError) {
      setErrorData(
        true,
        intl.formatMessage(
          {id: e.id, defaultMessage: e.defaultMessage},
          e.values,
        ),
        e.values.response || null, // API errors should include a response
      )
    } else {
      setErrorData(
        true,
        intl.formatMessage(errorMessages.generalTxError.message),
        e.message || null,
      )
    }
  }
}

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const DelegationConfirmation = (
  {
    intl,
    route,
    onDelegate,
    isEasyConfirmationEnabled,
    password,
    setPassword,
    sendingTransaction,
    processingTx,
    doNothing,
    isHW,
    defaultAsset,
    ledgerDialogStep,
    closeLedgerDialog,
    useUSB,
    onChooseTransport,
    onConnectBLE,
    onConnectUSB,
    closeErrorModal,
    showErrorModal,
    errorMessage,
    errorLogs,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const poolHash = route.params.poolHash
  const poolName = route.params.poolName
  const delegationTxData: CreateDelegationTxResponse =
    route.params.transactionData
  const amountToDelegate: MultiToken = delegationTxData.totalAmountToDelegate
  const transactionFee: MultiToken = route.params.transactionFee
  const reward = approximateReward(amountToDelegate.getDefault())

  const isConfirmationDisabled =
    (!isEasyConfirmationEnabled && !password && !isHW) || processingTx

  return (
    <View style={styles.container}>
      <OfflineBanner />
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
            {formatTokenAmount(transactionFee.getDefault(), defaultAsset)}
            {` ${intl.formatMessage(messages.ofFees)}`}
          </Text>
          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={doNothing}
            editable={false}
            value={formatTokenAmount(
              amountToDelegate.getDefault(),
              defaultAsset,
            )}
            label={intl.formatMessage(txLabels.amount)}
          />
        </View>
        {/* eslint-disable indent */
        !isEasyConfirmationEnabled &&
          !isHW && (
            <View style={styles.input}>
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={intl.formatMessage(txLabels.password)}
                onChangeText={setPassword}
              />
            </View>
          )
        /* eslint-enable indent */
        }
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(messages.rewardsExplanation)}
          </Text>
          <Text style={styles.rewards}>
            {formatTokenWithText(reward, defaultAsset)}
          </Text>
        </View>
        {isHW && <HWInstructions useUSB={useUSB} addMargin />}
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

      {/* eslint-disable indent */
      isHW &&
        Platform.OS === 'android' &&
        CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
          <>
            <LedgerTransportSwitchModal
              visible={
                ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT
              }
              onRequestClose={closeLedgerDialog}
              onSelectUSB={(event) => onChooseTransport(event, true)}
              onSelectBLE={(event) => onChooseTransport(event, false)}
              showCloseIcon
            />
            <Modal
              visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT}
              onRequestClose={closeLedgerDialog}
            >
              <LedgerConnect
                onConnectBLE={onConnectBLE}
                onConnectUSB={onConnectUSB}
                useUSB={useUSB}
              />
            </Modal>
          </>
        )
      /* eslint-enable indent */
      }
      <ErrorModal
        visible={showErrorModal}
        title={intl.formatMessage(errorMessages.generalTxError.title)}
        errorMessage={errorMessage}
        errorLogs={errorLogs}
        onRequestClose={closeErrorModal}
      />

      <PleaseWaitModal
        title={intl.formatMessage(txLabels.submittingTx)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={sendingTransaction}
      />
    </View>
  )
}

type ExternalProps = {|
  intl: IntlShape,
  navigation: Navigation,
  route: Object, // TODO(navigation): type
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
        isHW: isHWSelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
        defaultAsset: defaultNetworkAssetSelector(state),
      }),
      {
        submitTransaction,
        submitSignedTx,
        setLedgerDeviceId,
        setLedgerDeviceObj,
      },
    ),
    withStateHandlers(
      {
        password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
        sendingTransaction: false,
        processingTx: false,
        useUSB: false,
        ledgerDialogStep: LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT,
        showErrorModal: false,
        errorMessage: '',
        errorLogs: '',
      },
      {
        doNothing: () => () => ({}),
        setPassword: () => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
        setProcessingTx: () => (processingTx) => ({
          processingTx,
        }),
        openLedgerConnect: () => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.LEDGER_CONNECT,
        }),
        closeLedgerDialog: () => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.CLOSED,
        }),
        setUseUSB: () => (useUSB) => ({useUSB}),
        closeErrorModal: () => () => ({showErrorModal: false}),
        setErrorData: () => (showErrorModal, errorMessage, errorLogs) => ({
          showErrorModal,
          errorMessage,
          errorLogs,
        }),
      },
    ),
    withHandlers({
      onChooseTransport: ({
        hwDeviceInfo,
        setUseUSB,
        openLedgerConnect,
        closeLedgerDialog,
      }) => (event, useUSB) => {
        setUseUSB(useUSB)
        if (
          (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
          (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
        ) {
          openLedgerConnect()
        } else {
          closeLedgerDialog()
        }
      },
      onConnectUSB: ({setLedgerDeviceObj, closeLedgerDialog}) => async (
        deviceObj,
      ) => {
        await setLedgerDeviceObj(deviceObj)
        closeLedgerDialog()
      },
      onConnectBLE: ({setLedgerDeviceId, closeLedgerDialog}) => async (
        deviceId,
      ) => {
        await setLedgerDeviceId(deviceId)
        closeLedgerDialog()
      },
      onDelegate: ignoreConcurrentAsyncHandler(
        (
          {
            navigation,
            route,
            isHW,
            isEasyConfirmationEnabled,
            password,
            submitTransaction,
            submitSignedTx,
            setSendingTransaction,
            setProcessingTx,
            intl,
            useUSB,
            setErrorData,
          }: {intl: IntlShape} & Object /* TODO: type */,
        ) => async (_event) => {
          await handleOnConfirm(
            navigation,
            route,
            isHW,
            isEasyConfirmationEnabled,
            password,
            submitTransaction,
            submitSignedTx,
            setSendingTransaction,
            setProcessingTx,
            intl,
            useUSB,
            setErrorData,
          )
        },
        1000,
      ),
    }),
  )(DelegationConfirmation): ComponentType<ExternalProps>),
)
