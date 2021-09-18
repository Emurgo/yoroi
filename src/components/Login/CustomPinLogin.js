// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, signin} from '../../actions'
import {CONFIG} from '../../config/config'
import {authenticateByCustomPin} from '../../crypto/customPin'
import {errorMessages} from '../../i18n/global-messages'
import {customPinHashSelector} from '../../selectors'
import PinInput from '../Common/PinInput'
import {StatusBar} from '../UiKit'
import styles from './styles/CustomPinLogin.style'

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

type Props = {
  intl: IntlShape,
}

const CustomPinLogin = injectIntl(({intl}: Props) => {
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
          title: intl.formatMessage(messages.title),
          subtitle: '',
          subtitle2: '',
        }}
        onPinEnter={onPinEnter}
      />
    </View>
  )
})

export default injectIntl(CustomPinLogin)
