import {useIntl} from 'react-intl'

import globalMessages, {ledgerMessages} from '../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    error: intl.formatMessage(globalMessages.error),
    rejectedByUser: intl.formatMessage(ledgerMessages.rejectedByUserError),
    cancel: intl.formatMessage(globalMessages.cancel),
    tryAgain: intl.formatMessage(globalMessages.tryAgain),
    bluetoothDisabledError: intl.formatMessage(ledgerMessages.bluetoothDisabledError),
    ledgerUserError: intl.formatMessage(ledgerMessages.connectionError),
    ledgerBluetoothDisabledError: intl.formatMessage(ledgerMessages.bluetoothDisabledError),
    ledgerGeneralConnectionError: intl.formatMessage(ledgerMessages.connectionError),
    ledgerAdaAppNeedsToBeOpenError: intl.formatMessage(ledgerMessages.appOpened),
  }
}
