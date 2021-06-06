// @flow
import React from 'react'
import {View} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import PinInput from '../Common/PinInput'
import PinRegistrationForm from '../Common/PinRegistrationForm'
import {authenticateByCustomPin} from '../../crypto/customPin'
import {encryptAndStoreCustomPin, showErrorDialog} from '../../actions'
import {customPinHashSelector} from '../../selectors'
import {CONFIG} from '../../config/config'
import {withNavigationTitle} from '../../utils/renderUtils'
import {StatusBar} from '../UiKit'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/ChangeCustomPinScreen.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const messages = defineMessages({
  currentPinInputTitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
    defaultMessage: 'Login',
  },
  currentPinInputSubtitle: {
    id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
    defaultMessage: 'Enter your current PIN',
    description: 'some desc',
  },
  pinInputTitle: {
    id:
      'components.settings.changecustompinscreen.PinRegistrationForm.PinInput.title',
    defaultMessage: 'Enter PIN',
    description: 'some desc',
  },
  pinInputSubtitle: {
    id:
      'components.settings.changecustompinscreen.PinRegistrationForm.PinInput.subtitle',
    defaultMessage: 'Choose new PIN for quick access to wallet.',
    description: 'some desc',
  },
  pinConfirmationTitle: {
    id:
      'components.settings.changecustompinscreen.PinRegistrationForm.PinConfirmationInput.title',
    defaultMessage: 'Repeat PIN',
    description: 'some desc',
  },
  title: {
    id: 'components.settings.changecustompinscreen.title',
    defaultMessage: 'Change PIN',
    description: 'some desc',
  },
})

const handleVerifyPin = ({
  currentPinHash,
  setIsCurrentPinVerified,
  intl,
}) => async (pin): Promise<boolean> => {
  let isPinValid
  try {
    isPinValid = await authenticateByCustomPin(currentPinHash, pin)
  } catch (err) {
    setIsCurrentPinVerified(false)
    await showErrorDialog(errorMessages.generalError, intl, {
      message: err.message,
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

const handleNewPinEnter = ({navigation, encryptAndStoreCustomPin}) => async (
  pin,
) => {
  await encryptAndStoreCustomPin(pin)
  navigation.goBack()
}

const ChangeCustomPinScreen = (
  {
    intl,
    isCurrentPinVerified,
    handleNewPinEnter,
    handleVerifyPin,
    navigation,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => (
  <View style={styles.container}>
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
        navigation={navigation}
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
  </View>
)

export default injectIntl(
  (compose(
    connect(
      (state: State) => ({
        currentPinHash: customPinHashSelector(state),
      }),
      {
        encryptAndStoreCustomPin,
      },
    ),
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),
    withState('isCurrentPinVerified', 'setIsCurrentPinVerified', false),
    withHandlers({
      handleVerifyPin,
      handleNewPinEnter,
    }),
  )(ChangeCustomPinScreen): ComponentType<{|
    navigation: Navigation,
    route: any,
    intl: IntlShape,
  |}>),
)
