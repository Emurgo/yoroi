// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {CONFIG} from '../../config/config'
import PinInput from '../Common/PinInput'
import {withNavigationTitle} from '../../utils/renderUtils'
import {withHandlers} from 'recompose'
import {authenticateByCustomPin} from '../../crypto/customPin'
import {customPinHashSelector} from '../../selectors'
import {showErrorDialog, signin} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import {StatusBar} from '../UiKit'

import styles from './styles/CustomPinLogin.style'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

type Props = {
  intl: IntlShape,
  onPinEnter: (pin: string) => Promise<boolean>,
}

const CustomPinLogin = injectIntl(({intl, onPinEnter}: Props) => (
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
))

type ExternalProps = {|
  navigation: Navigation,
  customPinHash: ?string,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        customPinHash: customPinHashSelector(state),
      }),
      {signin},
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onPinEnter: ({customPinHash, intl, signin}) => async (pin) => {
        if (customPinHash == null) {
          throw new Error('Custom pin is not setup')
        }

        const isPinValid = await authenticateByCustomPin(customPinHash, pin)
        if (isPinValid) {
          signin()
        } else {
          await showErrorDialog(errorMessages.incorrectPin, intl)
        }

        return !isPinValid
      },
    }),
  )(CustomPinLogin): ComponentType<ExternalProps>),
)
