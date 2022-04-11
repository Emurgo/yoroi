/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {useIntl} from 'react-intl'
import {Platform} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {Modal} from '../components'
import {LedgerTransportSwitchModal} from '../HW'
import {LedgerConnect} from '../HW'
import {errorMessages} from '../i18n/global-messages'
import LocalizableError from '../i18n/LocalizableError'
import {showErrorDialog} from '../legacy/actions'
import {formatPath} from '../legacy/commonUtils'
import {CONFIG} from '../legacy/config'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../legacy/hwWallet'
import {verifyAddress} from '../legacy/ledgerUtils'
import {Logger} from '../legacy/logging'
import {getCardanoByronConfig} from '../legacy/networks'
import {externalAddressIndexSelector, hwDeviceInfoSelector} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {walletManager} from '../yoroi-wallets'
import AddressModal from './AddressModal'
import {AddressVerifyModal} from './AddressVerifyModal'

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
      walletManager.getAddressingInfo(address) as any,
      hwDeviceInfo,
      useUSB,
    )
      .catch((error) => {
        if (error instanceof LocalizableError) {
          showErrorDialog(errorMessages.generalLocalizableError, intl, {
            message: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, (error as any).values),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        path={formatPath(0, 'External', index as any, wallet.walletImplementationId)}
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
