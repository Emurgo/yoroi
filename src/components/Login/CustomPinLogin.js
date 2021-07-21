// @flow

import React from 'react'
import {View} from 'react-native'
import {useSelector, useDispatch} from 'react-redux'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {CONFIG} from '../../config/config'
import PinInput from '../Common/PinInput'
import {authenticateByCustomPin} from '../../crypto/customPin'
import {customPinHashSelector} from '../../selectors'
import {showErrorDialog, signin} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import {StatusBar} from '../UiKit'

import styles from './styles/CustomPinLogin.style'

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

type RouterProps = {|
  navigation: any,
  route: any,
|}

type Props = {|
  intl: IntlShape,
|}

const CustomPinLogin = injectIntl(({intl}: Props & RouterProps) => {
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
