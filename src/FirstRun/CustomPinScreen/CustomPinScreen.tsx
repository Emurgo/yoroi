import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {PinRegistrationForm} from '../../auth'
import {StatusBar} from '../../components'
import {encryptAndStoreCustomPin, setSystemAuth, signin} from '../../legacy/actions'
import {isAuthenticatedSelector} from '../../legacy/selectors'

export const CustomPinScreen = () => {
  const strings = useStrings()
  const isAuth = useSelector(isAuthenticatedSelector)
  const dispatch = useDispatch()
  const handlePinEntered = async (pin: string) => {
    await dispatch(setSystemAuth(false))
    await dispatch(encryptAndStoreCustomPin(pin))
    if (!isAuth) dispatch(signin()) // because in first run user is not authenticated
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="customPinContainer">
      <StatusBar type="dark" />

      <PinRegistrationForm
        onPinEntered={handlePinEntered}
        labels={{
          PinInput: {
            title: strings.pinInputTitle,
            subtitle: strings.pinInputSubtitle,
          },
          PinConfirmationInput: {
            title: strings.pinConfirmationTitle,
          },
        }}
      />
    </SafeAreaView>
  )
}

const messages = defineMessages({
  pinInputTitle: {
    id: 'components.firstrun.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter the PIN',
  },
  pinInputSubtitle: {
    id: 'components.firstrun.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
  },
  pinConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    pinInputTitle: intl.formatMessage(messages.pinInputTitle),
    pinInputSubtitle: intl.formatMessage(messages.pinInputSubtitle),
    pinConfirmationTitle: intl.formatMessage(messages.pinConfirmationTitle),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
