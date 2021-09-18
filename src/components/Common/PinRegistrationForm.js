// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {type IntlShape, injectIntl} from 'react-intl'
import {View} from 'react-native'

import {showErrorDialog} from '../../actions'
import {CONFIG} from '../../config/config'
import {errorMessages} from '../../i18n/global-messages'
import type {PinInputLabels} from './PinInput'
import PinInput from './PinInput'
import styles from './styles/PinRegistrationForm.style'

type PinRegistrationFormLabels = {
  PinInput: PinInputLabels,
  PinConfirmationInput: PinInputLabels,
}

type Props = {
  labels: PinRegistrationFormLabels,
  onPinEntered: (string) => any,
  intl: IntlShape,
}

const PinRegistrationForm = ({labels, onPinEntered, intl}: Props) => {
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
        message: err.message,
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

export default injectIntl(PinRegistrationForm)
