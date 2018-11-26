// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import PinInput from '../Common/PinInput'
import {CONFIG} from '../../config'
import {withTranslations} from '../../utils/renderUtils'
import {showErrorDialog} from '../../actions'

import styles from './styles/PinRegistrationForm.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.PinRegistrationForm

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

type Props = {
  pin: string,
  setPin: (string) => void,
  translations: SubTranslation<typeof getTranslations>,
  handlePinEnter: (string) => void,
  clearPin: () => void,
}

const PinRegistrationForm = ({
  pin,
  setPin,
  translations,
  handlePinEnter,
  clearPin,
}: Props) => {
  const labels = !pin
    ? translations.PinInput
    : translations.PinConfirmationInput

  return (
    <View style={styles.container}>
      <NavigationEvents onDidBlur={clearPin} />
      <PinInput
        labels={labels}
        onPinEnter={pin ? handlePinEnter : setPin}
        pinMaxLength={CONFIG.PIN_LENGTH}
      />
    </View>
  )
}

type ExternalProps = {
  onValidPinEnter: (string) => void,
}

export default (compose(
  withTranslations(getTranslations),
  withState('pin', 'setPin', ''),
  withHandlers({
    handlePinEnter,
    clearPin: ({setPin}) => () => setPin(''),
  }),
)(PinRegistrationForm): ComponentType<ExternalProps>)
