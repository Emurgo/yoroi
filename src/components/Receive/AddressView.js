// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {View, TouchableOpacity, Image, Platform} from 'react-native'
import {injectIntl, intlShape} from 'react-intl'

import {
  isUsedAddressIndexSelector,
  externalAddressIndexSelector,
  hwDeviceInfoSelector,
  walletMetaSelector,
} from '../../selectors'
import {showErrorDialog} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'

import {Text, Modal} from '../UiKit'
import AddressModal from './AddressModal'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import AddressVerifyModal from './AddressVerifyModal'
import {verifyAddress} from '../../crypto/shelley/ledgerUtils'
import walletManager from '../../crypto/walletManager'
import {formatPath} from '../../crypto/commonUtils'
import {errorMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {Logger} from '../../utils/logging'
import {CONFIG} from '../../config/config'

import styles from './styles/AddressView.style'
import infoIcon from '../../assets/img/icon/info.png'

import type {ComponentType} from 'react'
import type {
  HWDeviceInfo,
  DeviceId,
  DeviceObj,
} from '../../crypto/shelley/ledgerUtils'
import type {WalletMeta} from '../../state'

const _handleOnVerifyAddress = async (
  intl: intlShape,
  address: string,
  index: number,
  hwDeviceInfo: HWDeviceInfo,
  walletMeta: WalletMeta,
  useUSB: boolean,
  closeDetails: () => void,
  withActivityIndicator: (() => Promise<void>) => Promise<void>,
) => {
  await withActivityIndicator(async () => {
    try {
      const addressingInfo = walletManager.getAddressingInfo(address)
      if (addressingInfo == null) {
        throw new Error('No addressing data, should never happen')
      }
      await verifyAddress(
        walletMeta.walletImplementationId,
        address,
        addressingInfo,
        hwDeviceInfo,
        useUSB,
      )
    } catch (e) {
      if (e instanceof LocalizableError) {
        await showErrorDialog(errorMessages.generalLocalizableError, intl, {
          message: intl.formatMessage(
            {
              id: e.id,
              defaultMessage: e.defaultMessage,
            },
            e.values,
          ),
        })
      } else {
        Logger.error(e)
        await showErrorDialog(errorMessages.hwConnectionError, intl, {
          message: String(e.message),
        })
      }
    } finally {
      closeDetails()
    }
  })
}

const ADDRESS_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  ADDRESS_DETAILS: 'ADDRESS_DETAILS',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  ADDRESS_VERIFY: 'ADDRESS_VERIFY',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}
type AddressDialogSteps = $Values<typeof ADDRESS_DIALOG_STEPS>

type Props = {|
  index: number,
  address: string,
  isUsed: boolean,
  walletMeta: WalletMeta,
  openDetails: () => void,
  closeDetails: () => void,
  onVerifyAddress: () => void,
  addressDialogStep: AddressDialogSteps,
  onToggleAddrVerifyDialog: () => void,
  openTransportSwitch: () => void,
  onChooseTransport: (Object, boolean) => void,
  openAddressVerify: () => void,
  useUSB: boolean,
  isWaiting: boolean,
  onConnectBLE: (DeviceId) => void,
  onConnectUSB: (DeviceObj) => void,
|}

const AddressView = ({
  index,
  address,
  isUsed,
  walletMeta,
  openDetails,
  closeDetails,
  onVerifyAddress,
  addressDialogStep,
  onToggleAddrVerifyDialog,
  onChooseTransport,
  useUSB,
  isWaiting,
  onConnectUSB,
  onConnectBLE,
}: Props) => (
  <>
    <TouchableOpacity activeOpacity={0.5} onPress={openDetails}>
      <View style={styles.container}>
        <View style={styles.addressContainer}>
          <Text secondary={isUsed} small bold>{`/${index}`}</Text>
          <Text
            secondary={isUsed}
            small
            numberOfLines={1}
            ellipsizeMode="middle"
            monospace
            style={styles.text}
          >
            {address}
          </Text>
        </View>
        <Image source={infoIcon} style={styles.image} />
      </View>
    </TouchableOpacity>

    <AddressModal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS}
      address={address}
      onRequestClose={closeDetails}
      onAddressVerify={onToggleAddrVerifyDialog}
    />

    <LedgerTransportSwitchModal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT}
      onRequestClose={closeDetails}
      onSelectUSB={(event) => onChooseTransport(event, true)}
      onSelectBLE={(event) => onChooseTransport(event, false)}
      showCloseIcon
    />

    <Modal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.LEDGER_CONNECT}
      onRequestClose={closeDetails}
    >
      <LedgerConnect
        onConnectBLE={onConnectBLE}
        onConnectUSB={onConnectUSB}
        useUSB={useUSB}
      />
    </Modal>

    <AddressVerifyModal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY}
      onRequestClose={closeDetails}
      showCloseIcon
      onConfirm={onVerifyAddress}
      address={address}
      path={formatPath(0, 'External', index, walletMeta.walletImplementationId)}
      isWaiting={isWaiting}
      disableButtons={isWaiting}
      useUSB={useUSB}
    />
  </>
)

type ExternalProps = {|
  address: string,
|}

export default injectIntl(
  (compose(
    connect(
      (state, {address}) => ({
        index: externalAddressIndexSelector(state)[address],
        isUsed: !!isUsedAddressIndexSelector(state)[address],
        hwDeviceInfo: hwDeviceInfoSelector(state),
        walletMeta: walletMetaSelector(state),
      }),
      {
        setLedgerDeviceId,
        setLedgerDeviceObj,
      },
    ),
    withStateHandlers(
      {
        addressDialogStep: ADDRESS_DIALOG_STEPS.CLOSED,
        useUSB: false,
        isWaiting: false,
        deviceId: null,
      },
      {
        openDetails: () => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS,
        }),
        closeDetails: () => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.CLOSED,
        }),
        openTransportSwitch: () => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT,
        }),
        openLedgerConnect: () => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.LEDGER_CONNECT,
        }),
        openAddressVerify: () => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY,
        }),
        setUseUSB: () => (useUSB) => ({useUSB}),
        setIsWaiting: () => (isWaiting) => ({isWaiting}),
      },
    ),
    withHandlers({
      withActivityIndicator: ({setIsWaiting}) => async (
        func: () => Promise<void>,
      ): Promise<void> => {
        setIsWaiting(true)
        try {
          await func()
        } finally {
          setIsWaiting(false)
        }
      },
      onToggleAddrVerifyDialog: ({
        openTransportSwitch,
        openAddressVerify,
      }) => () => {
        if (
          Platform.OS === 'android' &&
          CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
        ) {
          openTransportSwitch()
        } else {
          openAddressVerify()
        }
      },
    }),
    withHandlers({
      onChooseTransport: ({
        hwDeviceInfo,
        setUseUSB,
        openLedgerConnect,
        openAddressVerify,
      }) => (event, useUSB) => {
        setUseUSB(useUSB)
        Logger.debug('hwDeviceInfo', hwDeviceInfo)
        if (
          (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
          (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
        ) {
          openLedgerConnect()
        } else {
          openAddressVerify()
        }
      },
      onConnectUSB: ({setLedgerDeviceObj, openAddressVerify}) => (
        deviceObj,
      ) => {
        setLedgerDeviceObj(deviceObj)
        openAddressVerify()
      },
      onConnectBLE: ({setLedgerDeviceId, openAddressVerify}) => (deviceId) => {
        setLedgerDeviceId(deviceId)
        openAddressVerify()
      },
      onVerifyAddress: ({
        intl,
        address,
        index,
        hwDeviceInfo,
        walletMeta,
        useUSB,
        closeDetails,
        withActivityIndicator,
      }) => async (_event) => {
        await _handleOnVerifyAddress(
          intl,
          address,
          index,
          hwDeviceInfo,
          walletMeta,
          useUSB,
          closeDetails,
          withActivityIndicator,
        )
      },
    }),
  )(AddressView): ComponentType<ExternalProps>),
)
