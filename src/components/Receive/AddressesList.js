// @flow

import React from 'react'
import {useIntl} from 'react-intl'
import {FlatList, Platform} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {CONFIG} from '../../config/config'
import {getCardanoByronConfig} from '../../config/networks'
import {formatPath} from '../../crypto/commonUtils'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {verifyAddress} from '../../crypto/shelley/ledgerUtils'
import walletManager from '../../crypto/walletManager'
import {errorMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {isUsedAddressIndexSelector} from '../../selectors'
import {externalAddressIndexSelector, hwDeviceInfoSelector, walletMetaSelector} from '../../selectors'
import {Logger} from '../../utils/logging'
import LedgerConnect from '../Ledger/LedgerConnect'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import {Spacer} from '../UiKit'
import {Modal} from '../UiKit'
import AddressModal from './AddressModal'
import AddressVerifyModal from './AddressVerifyModal'
import AddressView from './AddressView'

const ADDRESS_DIALOG_STEPS = {
  ADDRESS_DETAILS: 'ADDRESS_DETAILS',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  ADDRESS_VERIFY: 'ADDRESS_VERIFY',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}
type AddressDialogSteps = $Values<typeof ADDRESS_DIALOG_STEPS>

type AddressesListProps = {
  addresses: Map<string, AddressDTOCardano>,
  showFresh?: boolean,
}
const AddressesList = ({addresses, showFresh}: AddressesListProps) => {
  const index = useSelector(externalAddressIndexSelector)
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)
  const allAddresses = [...addresses.values()]
  const shownAddresses: AddressDTOCardano[] = showFresh
    ? allAddresses.filter((addrInfo) => !isUsedAddressIndex[addrInfo.address])
    : allAddresses.filter((addrInfo) => isUsedAddressIndex[addrInfo.address])

  const [addressInfo, setAddressInfo] = React.useState<AddressDTOCardano | void>()

  return (
    <>
      <FlatList
        data={shownAddresses.reverse()}
        keyExtractor={(addressInfo) => addressInfo.address}
        renderItem={({item: addressInfo}) => (
          <AddressView
            isUsed={isUsedAddressIndex[addressInfo.address]}
            index={index[addressInfo.address]}
            address={addressInfo.address}
            onPressDetails={() => setAddressInfo(addressInfo)}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
      />

      {addressInfo && <Modals addressInfo={addressInfo} onDone={() => setAddressInfo()} />}
    </>
  )
}

export default AddressesList

type ModalsProps = {
  addressInfo: AddressDTOCardano,
  onDone: () => void,
}
const Modals = ({addressInfo, onDone}: ModalsProps) => {
  const intl = useIntl()
  const index = useSelector(externalAddressIndexSelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const dispatch = useDispatch()
  const [isWaiting, setIsWaiting] = React.useState(false)
  const [useUSB, setUseUSB] = React.useState(false)

  const [addressDialogStep, setAddressDialogStep] = React.useState<AddressDialogSteps>(
    ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS,
  )

  const onVerifyAddress = (addressInfo: AddressDTOCardano) => {
    if (!hwDeviceInfo) throw new Error('missing hwDeviceInfo')

    setIsWaiting(true)
    verifyAddress(
      walletMeta.walletImplementationId,
      walletMeta.networkId,
      getCardanoByronConfig().PROTOCOL_MAGIC,
      addressInfo.address,
      walletManager.getAddressingInfo(addressInfo.address),
      hwDeviceInfo,
      true,
    )
      .catch((error) => {
        if (error instanceof LocalizableError) {
          showErrorDialog(errorMessages.generalLocalizableError, intl, {
            message: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
          })
        } else {
          Logger.error(error)
          showErrorDialog(errorMessages.hwConnectionError, intl, {message: String(error.message)})
        }
      })
      .finally(() => {
        onDone()
        setIsWaiting(false)
      })
  }

  return (
    <>
      <AddressModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS}
        addressInfo={addressInfo}
        onRequestClose={onDone}
        onAddressVerify={() => {
          if (Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
            setAddressDialogStep(ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT)
          } else {
            setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
          }
        }}
      />

      <LedgerTransportSwitchModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.CHOOSE_TRANSPORT}
        onRequestClose={onDone}
        onSelectUSB={() => {
          setUseUSB(true)
          setAddressDialogStep(ADDRESS_DIALOG_STEPS.LEDGER_CONNECT)
        }}
        onSelectBLE={() => {
          setUseUSB(false)
          setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
        }}
        showCloseIcon
      />

      <Modal visible={addressDialogStep === ADDRESS_DIALOG_STEPS.LEDGER_CONNECT} onRequestClose={onDone}>
        <LedgerConnect
          onConnectBLE={async (deviceId) => {
            await dispatch(setLedgerDeviceId(deviceId))
            setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
          }}
          onConnectUSB={async (deviceObj) => {
            await dispatch(setLedgerDeviceObj(deviceObj))
            setAddressDialogStep(ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY)
          }}
          useUSB={useUSB}
        />
      </Modal>

      <AddressVerifyModal
        visible={addressDialogStep === ADDRESS_DIALOG_STEPS.ADDRESS_VERIFY}
        onRequestClose={onDone}
        onConfirm={() => onVerifyAddress(addressInfo)}
        addressInfo={addressInfo}
        path={formatPath(0, 'External', index, walletMeta.walletImplementationId)}
        isWaiting={isWaiting}
        useUSB={useUSB}
      />
    </>
  )
}
