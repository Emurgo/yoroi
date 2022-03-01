/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import {CommonActions} from '@react-navigation/routers'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {defineMessages} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, submitSignedTx, submitTransaction} from '../../../legacy/actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../../legacy/actions/hwWallet'
import {Button, Modal, OfflineBanner, PleaseWaitModal, Text, ValidatedTextInput} from '../../../legacy/components/UiKit'
import {CONFIG, UI_V2} from '../../../legacy/config/config'
import {WrongPassword} from '../../../legacy/crypto/errors'
import {ISignRequest} from '../../../legacy/crypto/ISignRequest'
import KeyStore from '../../../legacy/crypto/KeyStore'
import {MultiToken} from '../../../legacy/crypto/MultiToken'
import type {CreateDelegationTxResponse} from '../../../legacy/crypto/shelley/delegationUtils'
import walletManager, {SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import globalMessages, {errorMessages, txLabels} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {useParams} from '../../../legacy/navigation'
import {
  SEND_ROUTES,
  STAKING_CENTER_ROUTES,
  STAKING_DASHBOARD_ROUTES,
  WALLET_ROOT_ROUTES,
  WALLET_ROUTES,
} from '../../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isHWSelector,
} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {formatTokenAmount, formatTokenWithText} from '../../../legacy/utils/format'
import {ErrorModal} from '../../components'
import {Instructions as HWInstructions, LedgerTransportSwitchModal} from '../../HW'
import {LedgerConnect} from '../../HW'
import {DefaultAsset} from '../../types/cardano'

export type Params = {
  poolHash: string
  poolName: string
  transactionData: CreateDelegationTxResponse
  transactionFee: MultiToken
}

export const DelegationConfirmation = ({mockDefaultAsset}: {mockDefaultAsset?: DefaultAsset}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const route: any = useRoute()
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const isHW = useSelector(isHWSelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const defaultNetworkAsset = useSelector(defaultNetworkAssetSelector)
  const defaultAsset = mockDefaultAsset || defaultNetworkAsset
  const {poolHash, poolName, transactionData: delegationTxData, transactionFee} = useParams<Params>()
  const strings = useStrings()

  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  const [sendingTransaction, setSendingTransaction] = React.useState(false)
  const [processingTx, setProcessingTx] = React.useState(false)
  const [useUSB, setUseUSB] = React.useState(false)
  const [ledgerDialogStep, setLedgerDialogStep] = React.useState(LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorLogs, setErrorLogs] = React.useState('')

  const amountToDelegate: MultiToken = delegationTxData.totalAmountToDelegate
  const reward = approximateReward(amountToDelegate.getDefault())
  const isConfirmationDisabled = (!isEasyConfirmationEnabled && !password && !isHW) || processingTx

  const openLedgerConnect = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.LEDGER_CONNECT)
  const closeLedgerDialog = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.CLOSED)
  const closeErrorModal = () => setShowErrorModal(false)
  const setErrorData = (showErrorModal, errorMessage, errorLogs) => {
    setShowErrorModal(showErrorModal)
    setErrorMessage(errorMessage)
    setErrorLogs(errorLogs)
  }

  const onChooseTransport = (useUSB) => {
    setUseUSB(useUSB)
    if (
      (useUSB && (hwDeviceInfo as any).hwFeatures.deviceObj == null) ||
      (!useUSB && (hwDeviceInfo as any).hwFeatures.deviceId == null)
    ) {
      openLedgerConnect()
    } else {
      closeLedgerDialog()
    }
  }
  const onConnectUSB = async (deviceObj) => {
    await dispatch(setLedgerDeviceObj(deviceObj))
    closeLedgerDialog()
  }
  const onConnectBLE = async (deviceId) => {
    await dispatch(setLedgerDeviceId(deviceId))
    closeLedgerDialog()
  }

  const submitTx = async (tx: string | ISignRequest<any>, decryptedKey?: string) => {
    try {
      setSendingTransaction(true)
      if (decryptedKey != null) {
        await dispatch(submitTransaction(tx, decryptedKey))
      } else {
        await dispatch(submitSignedTx(tx))
      }
      navigation.dispatch(
        CommonActions.reset({
          key: null as any,
          index: 0,
          routes: [{name: STAKING_CENTER_ROUTES.MAIN}],
        }),
      )
      if (UI_V2) {
        navigation.dispatch(
          CommonActions.reset({
            key: null as any,
            index: 0,
            routes: [{name: STAKING_DASHBOARD_ROUTES.MAIN}],
          }),
        )
      }
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    } finally {
      setSendingTransaction(false)
    }
  }

  const onDelegate = async () => {
    const transactionData: CreateDelegationTxResponse = route.params?.transactionData
    if (transactionData == null) throw new Error('DelegationConfirmation:txData')
    const signRequest = transactionData.signRequest

    try {
      if (isHW) {
        try {
          setProcessingTx(true)
          const signedTx = await walletManager.signTxWithLedger(transactionData.signRequest, useUSB)
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
        const decryptedData = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

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
          intl.formatMessage({id: (e as any).id, defaultMessage: (e as any).defaultMessage}, (e as any).values),
          (e as any).values.response || null, // API errors should include a response
        )
      } else {
        setErrorData(true, intl.formatMessage(errorMessages.generalTxError.message), (e as any).message || null)
      }
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <OfflineBanner />
      <ScrollView style={styles.scrollView}>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolName}</Text>
          <Text>{poolName}</Text>
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolHash}</Text>
          <Text>{poolHash}</Text>
        </View>

        <View style={styles.input}>
          <Text small style={styles.fees}>
            {`+ ${formatTokenAmount(transactionFee.getDefault(), defaultAsset)} ${strings.ofFees}`}
          </Text>

          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={() => undefined}
            editable={false}
            value={formatTokenAmount(amountToDelegate.getDefault(), defaultAsset)}
            label={strings.amount}
          />
        </View>

        {!isEasyConfirmationEnabled && !isHW && (
          <View style={styles.input}>
            <ValidatedTextInput secureTextEntry value={password} label={strings.password} onChangeText={setPassword} />
          </View>
        )}

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.rewardsExplanation}</Text>
          <Text style={styles.rewards}>{formatTokenWithText(reward, defaultAsset)}</Text>
        </View>

        {isHW && <HWInstructions useUSB={useUSB} addMargin />}
      </ScrollView>

      <View style={styles.bottomBlock}>
        <Button
          block
          shelleyTheme
          onPress={onDelegate}
          title={strings.delegateButtonLabel}
          disabled={isConfirmationDisabled}
        />
      </View>

      {isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
        <>
          <LedgerTransportSwitchModal
            visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT}
            onRequestClose={closeLedgerDialog}
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
            showCloseIcon
          />
          <Modal visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT} onRequestClose={closeLedgerDialog}>
            <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
          </Modal>
        </>
      )}

      <ErrorModal
        visible={showErrorModal}
        title={strings.title}
        errorMessage={errorMessage}
        errorLogs={errorLogs}
        onRequestClose={closeErrorModal}
      />

      <PleaseWaitModal title={strings.submittingTx} spinnerText={strings.pleaseWait} visible={sendingTransaction} />
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    stakePoolName: intl.formatMessage(globalMessages.stakePoolName),
    stakePoolHash: intl.formatMessage(globalMessages.stakePoolHash),
    ofFees: intl.formatMessage(messages.ofFees),
    amount: intl.formatMessage(txLabels.amount),
    password: intl.formatMessage(txLabels.password),
    rewardsExplanation: intl.formatMessage(messages.rewardsExplanation),
    delegateButtonLabel: intl.formatMessage(messages.delegateButtonLabel),
    title: intl.formatMessage(errorMessages.generalTxError.title),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}

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
    defaultMessage: '!!!Current approximation of rewards that you will receive per epoch:',
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

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemBlock: {
    marginTop: 24,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#353535',
  },
  bottomBlock: {
    padding: 16,
    height: 88,
  },
  input: {
    marginTop: 16,
  },
  rewards: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 19,
    color: COLORS.SHELLEY_BLUE,
    fontWeight: '500',
  },
  fees: {
    textAlign: 'right',
    color: '#353535',
  },
})
