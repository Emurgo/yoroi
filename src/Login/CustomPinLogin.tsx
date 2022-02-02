import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, signin} from '../../legacy/actions'
import PinInput from '../../legacy/components/Common/PinInput'
import {StatusBar} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {authenticateByCustomPin} from '../../legacy/crypto/customPin'
import {errorMessages} from '../../legacy/i18n/global-messages'
import {customPinHashSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'

export const CustomPinLogin = () => {
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
    <View style={styles.root}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
