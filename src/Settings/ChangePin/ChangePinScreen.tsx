import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {encryptAndStoreCustomPin, showErrorDialog} from '../../../legacy/actions'
import PinInput from '../../../legacy/components/Common/PinInput'
import styles from '../../../legacy/components/Settings/styles/ChangeCustomPinScreen.style'
import {StatusBar} from '../../../legacy/components/UiKit'
import {CONFIG} from '../../../legacy/config/config'
import {authenticateByCustomPin} from '../../../legacy/crypto/customPin'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import {customPinHashSelector} from '../../../legacy/selectors'
import {PinRegistrationForm} from '../../auth'

export const ChangePinScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const currentPinHash = useSelector(customPinHashSelector)
  const [isCurrentPinVerified, setIsCurrentPinVerified] = React.useState(false)
  const handleVerifyPin = async (pin): Promise<boolean> => {
    let isPinValid
    try {
      if (!currentPinHash) {
        throw new Error('Missing currentPinHash')
      }
      isPinValid = await authenticateByCustomPin(currentPinHash, pin)
    } catch (err) {
      setIsCurrentPinVerified(false)
      await showErrorDialog(errorMessages.generalError, intl, {
        message: (err as Error).message,
      })
      return true
    }

    if (isPinValid) {
      setIsCurrentPinVerified(true)
      return false
    } else {
      await showErrorDialog(errorMessages.incorrectPin, intl)
      return true
    }
  }

  const handleNewPinEnter = async (pin) => {
    await dispatch(encryptAndStoreCustomPin(pin))
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      {isCurrentPinVerified ? (
        <PinRegistrationForm
          onPinEntered={handleNewPinEnter}
          labels={{
            PinInput: {
              title: intl.formatMessage(messages.pinInputTitle),
              subtitle: intl.formatMessage(messages.pinInputSubtitle),
            },
            PinConfirmationInput: {
              title: intl.formatMessage(messages.pinConfirmationTitle),
            },
          }}
        />
      ) : (
        <PinInput
          labels={{
            title: intl.formatMessage(messages.currentPinInputTitle),
            subtitle: intl.formatMessage(messages.currentPinInputSubtitle),
          }}
          onPinEnter={handleVerifyPin}
          pinMaxLength={CONFIG.PIN_LENGTH}
        />
      )}
    </View>
  )
}

const messages = defineMessages({
  currentPinInputTitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  currentPinInputSubtitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: '!!!Enter your current PIN',
  },
  pinInputTitle: {
    id: 'components.settings.changecustompinscreen.PinRegistrationForm.PinInput.title',
    defaultMessage: '!!!Enter PIN',
  },
  pinInputSubtitle: {
    id: 'components.settings.changecustompinscreen.PinRegistrationForm.PinInput.subtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
  },
  pinConfirmationTitle: {
    id: 'components.settings.changecustompinscreen.PinRegistrationForm.PinConfirmationInput.title',
    defaultMessage: '!!!Repeat PIN',
  },
})
