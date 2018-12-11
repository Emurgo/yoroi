// @flow
import React from 'react'
import {View} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'

import PinInput from '../Common/PinInput'
import PinRegistrationForm from '../Common/PinRegistrationForm'
import {authenticateByCustomPin} from '../../crypto/customPin'
import {encryptAndStoreCustomPin, showErrorDialog} from '../../actions'
import {customPinHashSelector} from '../../selectors'
import {CONFIG} from '../../config'
import {withNavigationTitle} from '../../utils/renderUtils'
import {StatusBar} from '../UiKit'

import styles from './styles/ChangeCustomPinScreen.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.ChangeCustomPinScreen

const handleVerifyPin = ({
  currentPinHash,
  setIsCurrentPinVerified,
  translations,
}) => async (pin): Promise<boolean> => {
  let isPinValid
  try {
    isPinValid = await authenticateByCustomPin(currentPinHash, pin)
  } catch (err) {
    setIsCurrentPinVerified(false)
    await showErrorDialog((dialogs) => dialogs.generalError(err.message))
    return true
  }

  if (isPinValid) {
    setIsCurrentPinVerified(true)
    return false
  } else {
    await showErrorDialog((dialogs) => dialogs.incorrectPin)
    return true
  }
}

const handleNewPinEnter = ({navigation, encryptAndStoreCustomPin}) => async (
  pin,
) => {
  await encryptAndStoreCustomPin(pin)
  navigation.goBack()
}

const ChangeCustomPinScreen = ({
  translations,
  navigation,
  isCurrentPinVerified,
  handleNewPinEnter,
  handleVerifyPin,
}) => (
  <View style={styles.container}>
    <StatusBar type="dark" />

    {isCurrentPinVerified ? (
      <PinRegistrationForm
        onPinEntered={handleNewPinEnter}
        labels={translations.PinRegistrationForm}
      />
    ) : (
      <PinInput
        labels={translations.CurrentPinInput}
        onPinEnter={handleVerifyPin}
        pinMaxLength={CONFIG.PIN_LENGTH}
      />
    )}
  </View>
)

export default (compose(
  connect(
    (state: State) => ({
      translations: getTranslations(state),
      currentPinHash: customPinHashSelector(state),
    }),
    {
      encryptAndStoreCustomPin,
    },
  ),
  withNavigationTitle(({translations}) => translations.title),
  withState('isCurrentPinVerified', 'setIsCurrentPinVerified', false),
  withHandlers({
    handleVerifyPin,
    handleNewPinEnter,
  }),
)(ChangeCustomPinScreen): ComponentType<{|navigation: Navigation|}>)
