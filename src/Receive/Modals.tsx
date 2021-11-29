import React from 'react'
import {useIntl} from 'react-intl'
import {Platform} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../legacy/actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../legacy/actions/hwWallet'
import LedgerConnect from '../../legacy/components/Ledger/LedgerConnect'
import LedgerTransportSwitchModal from '../../legacy/components/Ledger/LedgerTransportSwitchModal'
import AddressModal from '../../legacy/components/Receive/AddressModal'
import AddressVerifyModal from '../../legacy/components/Receive/AddressVerifyModal'
import {Modal} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {getCardanoByronConfig} from '../../legacy/config/networks'
import {formatPath} from '../../legacy/crypto/commonUtils'
import {verifyAddress} from '../../legacy/crypto/shelley/ledgerUtils'
import walletManager from '../../legacy/crypto/walletManager'
import {errorMessages} from '../../legacy/i18n/global-messages'
import LocalizableError from '../../legacy/i18n/LocalizableError'
import {externalAddressIndexSelector, hwDeviceInfoSelector} from '../../legacy/selectors'
import {Logger} from '../../legacy/utils/logging'
import {useSelectedWallet} from '../SelectedWallet'

export const Modals = ({address, onDone}: {address: string; onDone: () => void}) => {
  const intl = useIntl()
  const index = useSelector(externalAddressIndexSelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const wallet = useSelectedWallet()
  const dispatch = useDispatch()
  const [isWaiting, setIsWaiting] = React.useState(false)
  const [useUSB, setUseUSB] = React.useState(false)

  const [addressDialogStep, setAddressDialogStep] = React.useState<AddressDialogSteps>(
    ADDRESS_DIALOG_STEPS.ADDRESS_DETAILS,
  )

  const onVerifyAddress = (address: string) => {
    if (!hwDeviceInfo) throw new Error('missing hwDeviceInfo')

    setIsWaiting(true)
    verifyAddress(
      wallet.walletImplementationId,
      wallet.networkId,
      getCardanoByronConfig().PROTOCOL_MAGIC,
      address,
      walletManager.getAddressingInfo(address),
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
        address={address}
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
        onConfirm={() => onVerifyAddress(address)}
        address={address}
        path={formatPath(0, 'External', index, wallet.walletImplementationId)}
        isWaiting={isWaiting}
        useUSB={useUSB}
      />
    </>
  )
}

const ADDRESS_DIALOG_STEPS = {
  ADDRESS_DETAILS: 'ADDRESS_DETAILS',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  ADDRESS_VERIFY: 'ADDRESS_VERIFY',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
} as const
type AddressDialogSteps = typeof ADDRESS_DIALOG_STEPS[keyof typeof ADDRESS_DIALOG_STEPS]
