// @flow
import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'

import {
  easyConfirmationSelector,
  isHWSelector,
  hwDeviceInfoSelector,
} from '../../selectors'
import {
  showErrorDialog,
  submitDelegationTx,
  submitSignedTx,
} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {withNavigationTitle} from '../../utils/renderUtils'
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
import {formatAdaWithText, formatAda} from '../../utils/format'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import {
  SEND_ROUTES,
  WALLET_INIT_ROUTES,
  STAKING_CENTER_ROUTES,
  WALLET_ROUTES,
} from '../../RoutesList'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import KeyStore from '../../crypto/KeyStore'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import HWInstructions from '../Ledger/HWInstructions'
import LocalizableError from '../../i18n/LocalizableError'

import styles from './styles/DelegationConfirmation.style'

import type {BaseSignRequest} from '../../crypto/types'
import type {IntlShape} from 'react-intl'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'
import type {CreateDelegationTxResponse} from '../../crypto/shelley/delegationUtils'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.confirmDelegation.title',
    defaultMessage: '!!!Confirm delegation',
  },
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
  isHW,
  isEasyConfirmationEnabled,
  password,
  submitDelegationTx,
  submitSignedTx,
  setSendingTransaction,
  setProcessingTx,
  intl,
  useUSB,
  setErrorData,
) => {
  const transactionData = navigation.getParam('transactionData')
  const signRequest = transactionData.signTxRequest.signRequest

  const submitTx = async <T>(
    tx: string | BaseSignRequest<T>,
    decryptedKey: ?string,
  ) => {
    try {
      setSendingTransaction(true)
      if (decryptedKey != null) {
        await submitDelegationTx(decryptedKey, tx)
      } else {
        await submitSignedTx(tx)
      }
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    } catch (e) {
      if (e instanceof NetworkError) {
        // trigger error modal
        setErrorData(
          true,
          intl.formatMessage(errorMessages.networkError.message),
          null,
        )
      } else if (e instanceof ApiError) {
        setErrorData(
          true,
          intl.formatMessage(errorMessages.apiError.message),
          JSON.stringify(e.request),
        )
      } else {
        throw e
      }
    } finally {
      setSendingTransaction(false)
    }
  }

  if (isHW) {
    try {
      setProcessingTx(true)
      const signedTx = await walletManager.signTxWithLedger(
        transactionData.signTxRequest,
        useUSB,
      )
      await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
    } catch (e) {
      if (e instanceof LocalizableError) {
        setErrorData(
          true,
          intl.formatMessage({id: e.id, defaultMessage: e.defaultMessage}),
          null,
        )
      } else {
        setErrorData(
          true,
          intl.formatMessage(errorMessages.generalTxError.message),
          String(e.message),
        )
      }
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
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)

        return
      } else {
        setErrorData(
          true,
          intl.formatMessage(errorMessages.generalTxError.message),
          String(e.message),
        )
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
      setErrorData(
        true,
        intl.formatMessage(errorMessages.generalTxError.message),
        String(e.message),
      )
    }
  }
}

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const DelegationConfirmation = ({
  intl,
  navigation,
  onDelegate,
  isEasyConfirmationEnabled,
  password,
  setPassword,
  sendingTransaction,
  processingTx,
  doNothing,
  isHW,
  ledgerDialogStep,
  closeLedgerDialog,
  useUSB,
  onChooseTransport,
  onConnectBLE,
  onConnectUSB,
  closeErrorModal,
  showErrorModal,
  errorMessageHeader,
  errorMessage,
}) => {
  const poolHash = navigation.getParam('poolHash')
  const poolName = navigation.getParam('poolName')
  const delegationTxData: CreateDelegationTxResponse = navigation.getParam(
    'transactionData',
  )
  const amountToDelegate = delegationTxData.totalAmountToDelegate
  const transactionFee = navigation.getParam('transactionFee')
  const reward = approximateReward(amountToDelegate)

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
            {formatAda(transactionFee)}
            {` ${intl.formatMessage(messages.ofFees)}`}
          </Text>
          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={doNothing}
            editable={false}
            value={formatAda(amountToDelegate)}
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
          <Text style={styles.rewards}>{formatAdaWithText(reward)}</Text>
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
        message={errorMessageHeader}
        errorMessage={errorMessage}
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
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
        isHW: isHWSelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
      }),
      {
        submitDelegationTx,
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
        errorMessageHeader: '',
        errorMessage: '',
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
        setErrorData: () => (
          showErrorModal,
          errorMessageHeader,
          errorMessage,
        ) => ({showErrorModal, errorMessageHeader, errorMessage}),
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
      onConnectUSB: ({setLedgerDeviceObj, closeLedgerDialog}) => (
        deviceObj,
      ) => {
        setLedgerDeviceObj(deviceObj)
        closeLedgerDialog()
      },
      onConnectBLE: ({setLedgerDeviceId, closeLedgerDialog}) => (deviceId) => {
        setLedgerDeviceId(deviceId)
        closeLedgerDialog()
      },
      onDelegate: ignoreConcurrentAsyncHandler(
        ({
          navigation,
          isHW,
          isEasyConfirmationEnabled,
          password,
          submitDelegationTx,
          submitSignedTx,
          setSendingTransaction,
          setProcessingTx,
          intl,
          useUSB,
          setErrorData,
        }) => async (_event) => {
          await handleOnConfirm(
            navigation,
            isHW,
            isEasyConfirmationEnabled,
            password,
            submitDelegationTx,
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
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(DelegationConfirmation): ComponentType<ExternalProps>),
)
