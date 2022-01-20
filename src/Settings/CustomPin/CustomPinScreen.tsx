import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {encryptAndStoreCustomPin, signin} from '../../../legacy/actions'
import PinRegistrationForm from '../../../legacy/components/Common/PinRegistrationForm'
import {StatusBar} from '../../../legacy/components/UiKit'
import {isAuthenticatedSelector} from '../../../legacy/selectors'
import {useParams} from '../../navigation'

type Params = {
  onSuccess: () => void
}

export const CustomPinScreen = () => {
  const intl = useIntl()
  const isAuth = useSelector(isAuthenticatedSelector)
  const {onSuccess} = useParams(isParams)
  const dispatch = useDispatch()

  const handlePinEntered = async (pin) => {
    await dispatch(encryptAndStoreCustomPin(pin))
    if (!isAuth) dispatch(signin()) // because in first run user is not authenticated
    onSuccess()
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="customPinContainer">
      <StatusBar type="dark" />

      <PinRegistrationForm
        onPinEntered={handlePinEntered}
        labels={{
          PinInput: {
            title: intl.formatMessage(messages.pinInputTitle),
            subtitle: intl.formatMessage(messages.pinInputSubtitle),
          },
          PinConfirmationInput: {
            title: intl.formatMessage(messages.pinConfirmationTitle),
          },
        }}
      />
    </SafeAreaView>
  )
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return typeof params === 'object' && 'onSuccess' in params && typeof params.onSuccess === 'function'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
