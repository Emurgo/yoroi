import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {PinRegistrationForm} from '../../auth'
import {PinInput, StatusBar} from '../../components'
import {errorMessages} from '../../i18n/global-messages'
import {encryptAndStoreCustomPin, showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {authenticateByCustomPin} from '../../legacy/customPin'
import {customPinHashSelector} from '../../legacy/selectors'

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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
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
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
