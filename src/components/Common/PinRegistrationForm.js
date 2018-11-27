// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import PinInput from './PinInput'
import {CONFIG} from '../../config'
import {showErrorDialog} from '../../actions'

import styles from './styles/PinRegistrationForm.style'

import type {ComponentType} from 'react'
import type {PinInputLabels} from './PinInput'

const handlePinEnter = ({
  pin,
  setPin,
  encryptAndStoreCustomPin,
  onValidPinEnter,
}) => async (pinConfirmation) => {
  if (pin !== pinConfirmation) {
    setPin('')

    await showErrorDialog((dialogs) => dialogs.pinMismatch)
    return
  }

  try {
    await onValidPinEnter(pin)
  } catch (err) {
    setPin('')

    await showErrorDialog((dialogs) => dialogs.general)
  }
}

type PinRegistrationFormLabels = {
  PinInput: PinInputLabels,
  PinConfirmationInput: PinInputLabels,
}

type ExternalProps = {
  labels: PinRegistrationFormLabels,
  onValidPinEnter: (string) => void,
}

type Props = ExternalProps & {
  pin: string,
  setPin: (string) => void,
  handlePinEnter: (string) => void,
  clearPin: () => void,
}

const PinRegistrationForm = ({
  pin,
  setPin,
  labels,
  handlePinEnter,
  clearPin,
}: Props) => {
  const inputLabels = !pin ? labels.PinInput : labels.PinConfirmationInput

  return (
    <View style={styles.container}>
      <NavigationEvents onDidBlur={clearPin} />
      <PinInput
        labels={inputLabels}
        onPinEnter={pin ? handlePinEnter : setPin}
        pinMaxLength={CONFIG.PIN_LENGTH}
      />
    </View>
  )
}

export default (compose(
  withState('pin', 'setPin', ''),
  withHandlers({
    handlePinEnter,
    clearPin: ({setPin}) => () => setPin(''),
  }),
)(PinRegistrationForm): ComponentType<ExternalProps>)
