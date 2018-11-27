// @flow
import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import PinInput from '../Common/PinInput'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config'
import {encryptAndStoreCustomPin, showErrorDialog} from '../../actions'

import styles from './styles/CustomPinScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {State} from '../../state'

const getTranslations = (state: State) => state.trans.CustomPinScreen

const handlePinEnter = ({
  pin,
  setPin,
  navigation,
  translations,
  encryptAndStoreCustomPin,
}) => async (pinConfirmation) => {
  if (pin !== pinConfirmation) {
    setPin('')

    await showErrorDialog((dialogs) => dialogs.pinMismatch)
    return
  }

  try {
    await encryptAndStoreCustomPin(pin)

    navigation.navigate(WALLET_INIT_ROUTES.MAIN)
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

const CustomPinScreen = ({
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

export default compose(
  connect(
    (state: State) => ({
      translations: getTranslations(state),
    }),
    {
      encryptAndStoreCustomPin,
    },
  ),
  withState('pin', 'setPin', ''),
  withHandlers({
    handlePinEnter,
    clearPin: ({setPin}) => () => setPin(''),
  }),
)(CustomPinScreen)
