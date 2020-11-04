// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, intlShape} from 'react-intl'

import PinInput from './PinInput'
import {CONFIG} from '../../config/config'
import {showErrorDialog} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/PinRegistrationForm.style'

import type {ComponentType} from 'react'
import type {PinInputLabels} from './PinInput'

const handlePinEnter = ({pin, setPin, onPinEntered, intl}) => async (
  pinConfirmation,
) => {
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

type PinRegistrationFormLabels = {
  PinInput: PinInputLabels,
  PinConfirmationInput: PinInputLabels,
}

type ExternalProps = {
  labels: PinRegistrationFormLabels,
  onPinEntered: (string) => any,
  intl: intlShape,
}

type Props = ExternalProps & {
  pin: string,
  setPin: (string) => void,
  handleSetPin: (string) => Promise<boolean>,
  handlePinEnter: (string) => Promise<boolean>,
  clearPin: () => void,
}

const PinRegistrationForm = ({
  pin,
  handleSetPin,
  labels,
  handlePinEnter,
  clearPin,
  navigation,
}: Props) => {
  const inputLabels = !pin ? labels.PinInput : labels.PinConfirmationInput

  React.useEffect(
    () => {
      const unsubscribe = navigation.addListener('blur', () => {
        clearPin()
      })
      return unsubscribe
    },
    [navigation],
  )

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

export default injectIntl(
  (compose(
    withStateHandlers(
      {
        pin: '',
      },
      {
        setPin: () => (pin: string) => ({pin}),
        clearPin: () => () => ({pin: ''}),
      },
    ),
    withHandlers({
      handlePinEnter,
      handleSetPin: ({setPin}) => (pin) => {
        setPin(pin)

        return Promise.resolve(true)
      },
    }),
  )(PinRegistrationForm): ComponentType<ExternalProps>),
)
