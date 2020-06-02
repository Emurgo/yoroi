// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers, withHandlers} from 'recompose'
import {View, TouchableOpacity, Image} from 'react-native'
import {withNavigation} from 'react-navigation'
import {injectIntl, intlShape} from 'react-intl'

import {
  isUsedAddressIndexSelector,
  externalAddressIndexSelector,
  isHWSelector,
  hwDeviceInfoSelector,
} from '../../selectors'
import {showErrorDialog, handleGeneralError} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'

import {Text, Modal} from '../UiKit'
import AddressModal from './AddressModal'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import AddressVerifyModal from './AddressVerifyModal'
import {
  verifyAddress,
  GeneralConnectionError,
  LedgerUserError,
} from '../../crypto/byron/ledgerUtils'
import walletManager from '../../crypto/wallet'
import {formatBIP44} from '../../crypto/byron/util'
import {errorMessages} from '../../i18n/global-messages'
import {Logger} from '../../utils/logging'

import styles from './styles/AddressView.style'
import infoIcon from '../../assets/img/icon/info.png'

import type {ComponentType} from 'react'
import type {
  HWDeviceInfo,
  DeviceId,
  DeviceObj,
} from '../../crypto/byron/ledgerUtils'

const _handleOnVerifyAddress = async (
  intl: intlShape,
  address: string,
  index: number,
  hwDeviceInfo: HWDeviceInfo,
  useUSB: boolean,
  closeDetails: () => void,
  withActivityIndicator: (() => Promise<void>) => Promise<void>,
) => {
  await withActivityIndicator(async () => {
    try {
      const addressing = walletManager.getAddressingInfo(address)
      if (addressing == null) {
        throw new Error('No addressing data, should never happen')
      }
      await verifyAddress(address, {addressing}, hwDeviceInfo, useUSB)
    } catch (e) {
      if (e instanceof GeneralConnectionError || e instanceof LedgerUserError) {
        await showErrorDialog(errorMessages.hwConnectionError, intl)
      } else {
        handleGeneralError('Could not verify address', e, intl)
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
  openDetails: () => void,
  closeDetails: () => void,
  onVerifyAddress: () => void,
  addressDialogStep: AddressDialogSteps,
  openTransportSwitch: () => void,
  onChooseTransport: (Object, boolean) => void,
  openAddressVerify: () => void,
  useUSB: boolean,
  isWaiting: boolean,
  setLedgerDeviceId: (DeviceId) => void,
  setLedgerDeviceObj: (DeviceObj) => void,
|}

const AddressView = ({
  address,
  index,
  isUsed,
  isHW,
  openDetails,
  closeDetails,
  onVerifyAddress,
  addressDialogStep,
  openTransportSwitch,
  onChooseTransport,
  onSelectDevice,
  openAddressVerify,
  useUSB,
  isWaiting,
  setLedgerDeviceId,
  setLedgerDeviceObj,
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
        <Image source={infoIcon} width={24} />
      </View>
    </TouchableOpacity>

    <AddressModal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS}
      address={address}
      onRequestClose={closeDetails}
      onAddressVerify={openTransportSwitch}
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
        onSelectBLE={setLedgerDeviceId}
        onSelectUSB={setLedgerDeviceObj}
        onComplete={openAddressVerify}
        useUSB={useUSB}
        onWaitingMessage={''}
      />
    </Modal>

    <AddressVerifyModal
      visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY}
      onRequestClose={closeDetails}
      showCloseIcon
      onConfirm={onVerifyAddress}
      address={address}
      path={formatBIP44(0, 'External', index)}
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
    // TODO(ppershing): this makes Flow bail out from checking types
    withNavigation,
    connect(
      (state, {address}) => ({
        index: externalAddressIndexSelector(state)[address],
        isUsed: !!isUsedAddressIndexSelector(state)[address],
        isHW: isHWSelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
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
        openDetails: (state) => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS,
        }),
        closeDetails: (state) => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.CLOSED,
        }),
        openTransportSwitch: (state) => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT,
        }),
        openLedgerConnect: (state) => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.LEDGER_CONNECT,
        }),
        openAddressVerify: (state) => () => ({
          addressDialogStep: ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY,
        }),
        setUseUSB: (state) => (useUSB) => ({useUSB}),
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
      onSelectDevice: ({setLedgerDeviceId}) => () => ({}),
      onVerifyAddress: ({
        intl,
        address,
        index,
        hwDeviceInfo,
        useUSB,
        closeDetails,
        withActivityIndicator,
      }) => async (event) => {
        await _handleOnVerifyAddress(
          intl,
          address,
          index,
          hwDeviceInfo,
          useUSB,
          closeDetails,
          withActivityIndicator,
        )
      },
    }),
  )(AddressView): ComponentType<ExternalProps>),
)
