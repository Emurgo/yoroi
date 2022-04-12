import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {PinInput, StatusBar} from '../components'
import {errorMessages} from '../i18n/global-messages'
import {showErrorDialog, signin} from '../legacy/actions'
import {CONFIG} from '../legacy/config'
import {authenticateByCustomPin} from '../legacy/customPin'
import {customPinHashSelector} from '../legacy/selectors'

export const CustomPinLoginScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const dispatch = useDispatch()
  const customPinHash = useSelector(customPinHashSelector)
  const onPinEnter = async (pin: string) => {
    if (customPinHash == null) {
      throw new Error('Custom pin is not setup')
    }

    const isPinValid = await authenticateByCustomPin(customPinHash, pin)
    if (isPinValid) {
      dispatch(signin())
    } else {
      await showErrorDialog(errorMessages.incorrectPin, intl)
    }

    return !isPinValid
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <StatusBar type="dark" />

      <PinInput
        pinMaxLength={CONFIG.PIN_LENGTH}
        labels={{
          title: strings.title,
          subtitle: '',
          subtitle2: '',
        }}
        onPinEnter={onPinEnter}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}
