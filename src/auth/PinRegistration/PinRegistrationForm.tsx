import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {PinInput, PinInputLabels} from '../../components/'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'

type PinRegistrationFormLabels = {
  PinInput: PinInputLabels
  PinConfirmationInput: PinInputLabels
}

type Props = {
  labels: PinRegistrationFormLabels
  onPinEntered: (pin: string) => void
}

export const PinRegistrationForm = ({labels, onPinEntered}: Props) => {
  const intl = useIntl()
  const navigation = useNavigation()
  const [pin, setPin] = React.useState('')
  const clearPin = React.useCallback(() => setPin(''), [])

  const handleSetPin = (pin) => {
    setPin(pin)

    return Promise.resolve(true)
  }

  const handlePinEnter = async (pinConfirmation) => {
    if (pin !== pinConfirmation) {
      setPin('')
      await showErrorDialog(errorMessages.pinMismatch, intl)

      return true
    }

    try {
      await onPinEntered(pin)

      return false
    } catch (err) {
      setPin('')
      await showErrorDialog(errorMessages.generalError, intl, {
        message: (err as Error).message,
      })

      return true
    }
  }

  const inputLabels = !pin ? labels.PinInput : labels.PinConfirmationInput

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearPin()
    })
    return unsubscribe
  }, [navigation, pin, clearPin])

  return (
    <View style={styles.container}>
      <PinInput
        labels={inputLabels}
        onPinEnter={pin ? handlePinEnter : handleSetPin}
        pinMaxLength={CONFIG.PIN_LENGTH}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
