// @flow
import React from 'react'
import {Alert, View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {NavigationEvents} from 'react-navigation'

import PinInput from '../Common/PinInput'
import {withTranslations} from '../../utils/renderUtils'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config'

import styles from './styles/CustomPinScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {State} from '../../state'

const getTranslations = (state: State) => state.trans.CustomPinScreen

const handlePinEnter = ({pin, setPin, navigation, translations}) => (
  pinConfirmation,
) => {
  if (pin !== pinConfirmation) {
    setPin('')
    Alert.alert(
      translations.PinMismatchError.title,
      translations.PinMismatchError.text,
      [{text: translations.okButton}],
    )
    return
  }

  // TODO store pin

  navigation.navigate(WALLET_INIT_ROUTES.MAIN)
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
  withTranslations(getTranslations),
  withState('pin', 'setPin', ''),
  withHandlers({
    handlePinEnter,
    clearPin: ({setPin}) => () => setPin(''),
  }),
)(CustomPinScreen)
