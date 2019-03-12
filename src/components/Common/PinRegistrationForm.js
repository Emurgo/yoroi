// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {NavigationEvents} from 'react-navigation'
import {injectIntl, intlShape} from 'react-intl'

import PinInput from './PinInput'
import {CONFIG} from '../../config'
import {showErrorDialog} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/PinRegistrationForm.style'

import type {ComponentType} from 'react'
import type {PinInputLabels} from './PinInput'

const handlePinEnter = ({
  pin,
  setPin,
  encryptAndStoreCustomPin,
  onPinEntered,
  intl,
}) => async (pinConfirmation) => {
  if (pin !== pinConfirmation) {
    setPin('')
    await showErrorDialog(errorMessages.pinMismatch)

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
  intl,
}: Props) => {
  const inputLabels = !pin ? labels.PinInput : labels.PinConfirmationInput

  return (
    <View style={styles.container}>
      <NavigationEvents onDidBlur={clearPin} />
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
        setPin: (state) => (pin: string) => ({pin}),
        clearPin: (state) => () => ({pin: ''}),
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
