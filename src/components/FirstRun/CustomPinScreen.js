// @flow
import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withProps} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import PinRegistrationForm from '../Common/PinRegistrationForm'
import {encryptAndStoreCustomPin} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'
import {StatusBar} from '../UiKit'

import styles from './styles/CustomPinScreen.style'

import type {State} from '../../state'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.firstrun.custompinscreen.title',
    defaultMessage: '!!!Set PIN',
    description: "some desc",
  },
  pinInputTitle: {
    id: 'components.firstrun.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter the PIN',
    description: "some desc",
  },
  pinInputSubtitle: {
    id: 'components.firstrun.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
    description: "some desc",
  },
  pinConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
    description: "some desc",
  },
})

const CustomPinScreen = ({handlePinEntered, intl}) => (
  <View style={styles.container}>
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
  </View>
)

type ExternalProps = {|
  navigation: Navigation,
|}

export default injectIntl(compose(
  withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  connect(
    () => ({}),
    {
      encryptAndStoreCustomPin,
    },
  ),
  withProps(({navigation}) => ({
    onSuccess: navigation.getParam('onSuccess'),
  })),
  withHandlers({
    handlePinEntered: ({onSuccess, encryptAndStoreCustomPin}) => async (
      pin,
    ) => {
      await encryptAndStoreCustomPin(pin)
      onSuccess()
    },
  }),
)(CustomPinScreen): ComponentType<ExternalProps>)
