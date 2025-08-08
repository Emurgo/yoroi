import {defineMessages} from 'react-intl'

export const authMessages = defineMessages({
  unknownError: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error!',
  },
  tooManyAttempts: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many attempts',
  },
  invalidPin: {
    id: 'global.actions.dialogs.wrongPinError.title',
    defaultMessage: '!!!Invalid PIN',
  },
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize',
  },
  usePasscode: {
    id: 'auth.usePasscode',
    defaultMessage: '!!!Use passcode',
  },
  titleLoginWithPin: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
  titleChangePin: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  subtitleChangePin: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
  pinInputTitle: {
    id: 'components.initialization.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter PIN',
  },
  pinInputSubtitle: {
    id: 'components.initialization.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose a new PIN to quickly access your wallet',
  },
  pinInputConfirmationTitle: {
    id: 'components.initialization.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
  pinInputConfirmationSubTitle: {
    id: 'components.firstrun.custompinscreen.pinInputConfirmationSubTitle',
    defaultMessage: '!!!Repeat a new PIN to quickly access your wallet',
  },
}) 