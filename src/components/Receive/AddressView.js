// @flow

import Clipboard from '@react-native-community/clipboard'
import React, {useEffect, useState} from 'react'
import {type IntlShape, injectIntl} from 'react-intl'
import {Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import copiedIcon from '../../assets/img/icon/copied.png'
import copyIcon from '../../assets/img/icon/copy-ext.png'
import verifyIcon from '../../assets/img/icon/verify-address.png'
import {CONFIG} from '../../config/config'
import {getCardanoByronConfig} from '../../config/networks'
import {formatPath} from '../../crypto/commonUtils'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {verifyAddress} from '../../crypto/shelley/ledgerUtils'
import walletManager from '../../crypto/walletManager'
import {errorMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {
  externalAddressIndexSelector,
  hwDeviceInfoSelector,
  isUsedAddressIndexSelector,
  walletMetaSelector,
} from '../../selectors'
import {Logger} from '../../utils/logging'
import LedgerConnect from '../Ledger/LedgerConnect'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import {Modal, Text} from '../UiKit'
import AddressModal from './AddressModal'
import AddressVerifyModal from './AddressVerifyModal'

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
  addressInfo: AddressDTOCardano,
  intl: IntlShape,
|}

const AddressView = ({intl, addressInfo}: Props) => {
  const index = useSelector(externalAddressIndexSelector)[addressInfo.address]
  const isUsed = !!useSelector(isUsedAddressIndexSelector)[addressInfo.address]
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const dispatch = useDispatch()

  const [addressDialogStep, setAddressDialogStep] = React.useState<AddressDialogSteps>(ADDRESS_DIALOG_STEPS.CLOSED)
  const [useUSB, setUseUSB] = React.useState(false)
  const [isWaiting, setIsWaiting] = React.useState(false)

  const onToggleAddrVerifyDialog = () => {
    if (Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      setAddressDialogStep(ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT)
    } else {
      setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
    }
  }

  const onChooseTransport = (event, useUSB) => {
    if (!hwDeviceInfo) {
      throw new Error('missing hwDeviceInfo')
    }
    setUseUSB(useUSB)
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      setAddressDialogStep(ADDRESS_DIALOG_STEPS.LEDGER_CONNECT)
    } else {
      setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
    }
  }
  const onConnectUSB = async (deviceObj) => {
    await dispatch(setLedgerDeviceObj(deviceObj))
    setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
  }
  const onConnectBLE = async (deviceId) => {
    await dispatch(setLedgerDeviceId(deviceId))
    setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
  }
  const onVerifyAddress = async () => {
    if (!hwDeviceInfo) throw new Error('missing hwDeviceInfo')

    setIsWaiting(true)
    try {
      await verifyAddress(
        walletMeta.walletImplementationId,
        walletMeta.networkId,
        getCardanoByronConfig().PROTOCOL_MAGIC,
        addressInfo.address,
        walletManager.getAddressingInfo(addressInfo.address),
        hwDeviceInfo,
        useUSB,
      )
    } catch (error) {
      if (error instanceof LocalizableError) {
        await showErrorDialog(errorMessages.generalLocalizableError, intl, {
          message: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
        })
      } else {
        Logger.error(error)
        await showErrorDialog(errorMessages.hwConnectionError, intl, {message: String(error.message)})
      }
    } finally {
      setAddressDialogStep(ADDRESS_DIALOG_STEPS.CLOSED)
      setIsWaiting(false)
    }
  }

  return (
    <>
      <Row>
        <Address index={index} address={addressInfo.address} isUsed={isUsed} />

        <Actions>
          <CopyButton text={addressInfo.address} />
          <VerifyButton onPress={() => setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS)} />
        </Actions>
      </Row>

      <AddressModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS}
        addressInfo={addressInfo}
        onRequestClose={() => setAddressDialogStep(ADDRESS_DIALOG_STEPS.CLOSED)}
        onAddressVerify={onToggleAddrVerifyDialog}
      />

      <LedgerTransportSwitchModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT}
        onRequestClose={() => setAddressDialogStep(ADDRESS_DIALOG_STEPS.CLOSED)}
        onSelectUSB={(event) => onChooseTransport(event, true)}
        onSelectBLE={(event) => onChooseTransport(event, false)}
        showCloseIcon
      />

      <Modal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.LEDGER_CONNECT}
        onRequestClose={() => setAddressDialogStep(ADDRESS_DIALOG_STEPS.CLOSED)}
      >
        <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      </Modal>

      <AddressVerifyModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY}
        onRequestClose={() => setAddressDialogStep(ADDRESS_DIALOG_STEPS.CLOSED)}
        onConfirm={onVerifyAddress}
        addressInfo={addressInfo}
        path={formatPath(0, 'External', index, walletMeta.walletImplementationId)}
        isWaiting={isWaiting}
        useUSB={useUSB}
      />
    </>
  )
}

export default injectIntl(AddressView)

const Row = (props) => <View {...props} style={styles.container} />
const Address = ({isUsed, index, address}: {isUsed: boolean, index: number, address: string}) => (
  <View style={styles.addressContainer}>
    <Text secondary={isUsed} small bold>{`/${index}`}</Text>
    <Text secondary={isUsed} small numberOfLines={1} ellipsizeMode="middle" monospace style={styles.text}>
      {address}
    </Text>
  </View>
)
const Actions = (props) => <View {...props} style={styles.actionContainer} />
const CopyButton = ({text}: {text: string}) => {
  const [isCopying, setIsCopying] = useState<boolean>(false)

  useEffect(() => {
    if (isCopying) {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        Clipboard.setString(text)
        setIsCopying(false)
      }, MESSAGE_TIMEOUT)
    }
  }, [isCopying, setIsCopying, text])

  return (
    <TouchableOpacity onPress={() => setIsCopying(true)} disabled={isCopying}>
      <Image source={isCopying ? copiedIcon : copyIcon} />
    </TouchableOpacity>
  )
}
const VerifyButton = (props) => (
  <TouchableOpacity {...props}>
    <Image source={verifyIcon} />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    shadowColor: '#181a1e',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    flex: 4,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 5,
  },
  actionContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
})
