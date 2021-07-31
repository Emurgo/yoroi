// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import PinRegistrationForm from './PinRegistrationForm'

storiesOf('PinRegistrationForm', module).add('Default', ({navigation}) => (
  <PinRegistrationForm
    navigation={navigation}
    labels={{
      PinInput: {title: 'PinInput', subtitle: 'subtitle1', subtitle2: 'subtitle2'},
      PinConfirmationInput: {title: 'PinConfirmationInput', subtitle: 'subtitle1', subtitle2: 'subtitle2'},
    }}
    onPinEntered={action('onPinEntered')}
  />
))
