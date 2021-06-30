// @flow

import React, {useEffect, useState, useCallback} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {View, TouchableOpacity, Image, Platform} from 'react-native'
import {injectIntl, type IntlShape, defineMessages} from 'react-intl'
import Clipboard from '@react-native-community/clipboard'

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
import {getCardanoByronConfig} from '../../config/networks'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'

import styles from './styles/AddressView.style'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import verifyIcon from '../../assets/img/icon/verify-address.png'
import copiedIcon from '../../assets/img/icon/copied.png'

import type {ComponentType} from 'react'
import type {
  HWDeviceInfo,
  DeviceId,
  DeviceObj,
} from '../../crypto/shelley/ledgerUtils'
import type {WalletMeta} from '../../state'

const messages = defineMessages({
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy',
    description: 'some desc',
  },
  verifyLabel: {
    id: 'components.receive.addressview.verifyAddressLabel',
    defaultMessage: '!!!Verify',
    description: 'some desc',
  },
})

const _handleOnVerifyAddress = async (
  intl: IntlShape,
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
        walletMeta.networkId,
        getCardanoByronConfig().PROTOCOL_MAGIC,
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

const MESSAGE_TIMEOUT = 1000
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
  addressInfo: AddressDTOCardano,
  isUsed: boolean,
  walletMeta: $Diff<WalletMeta, {id: string}>,
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
  intl: IntlShape,
|}

const AddressView = ({
  index,
  addressInfo,
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
  intl,
}: Props) => {
  const [isCopying, setIsCopying] = useState<boolean>(false)

  useEffect(
    () => {
      if (isCopying) {
        const timeout = setTimeout(() => {
          clearTimeout(timeout)
          Clipboard.setString(addressInfo.address)
          setIsCopying(false)
        }, MESSAGE_TIMEOUT)
      }
    },
    [isCopying, setIsCopying],
  )

  const _copyHandler = useCallback(
    () => {
      setIsCopying(true)
    },
    [setIsCopying],
  )

  return (
    <>
      <View style={styles.container}>
        <View style={styles.addressContainer}>
          <>
            <Text secondary={isUsed} small bold>{`/${index}`}</Text>
            <Text
              secondary={isUsed}
              small
              numberOfLines={1}
              ellipsizeMode="middle"
              monospace
              style={styles.text}
            >
              {addressInfo.address}
            </Text>
          </>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            accessibilityLabel={intl.formatMessage(messages.copyLabel)}
            accessibilityRole="button"
            onPress={_copyHandler}
            disabled={isCopying}
          >
            <Image source={isCopying ? copiedIcon : copyIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={intl.formatMessage(messages.verifyLabel)}
            accessibilityRole="button"
            onPress={openDetails}
          >
            <Image source={verifyIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <AddressModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS}
        addressInfo={addressInfo}
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
        onConfirm={onVerifyAddress}
        addressInfo={addressInfo}
        path={formatPath(
          0,
          'External',
          index,
          walletMeta.walletImplementationId,
        )}
        isWaiting={isWaiting}
        useUSB={useUSB}
      />
    </>
  )
}

type ExternalProps = {|
  addressInfo: AddressDTOCardano,
|}

export default injectIntl(
  (compose(
    connect(
      (state, {addressInfo}) => ({
        index: externalAddressIndexSelector(state)[(addressInfo?.address)],
        isUsed: !!isUsedAddressIndexSelector(state)[(addressInfo?.address)],
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
      onConnectUSB: ({setLedgerDeviceObj, openAddressVerify}) => async (
        deviceObj,
      ) => {
        await setLedgerDeviceObj(deviceObj)
        openAddressVerify()
      },
      onConnectBLE: ({setLedgerDeviceId, openAddressVerify}) => async (
        deviceId,
      ) => {
        await setLedgerDeviceId(deviceId)
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
