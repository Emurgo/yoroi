import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {PinRegistrationForm} from './PinRegistrationForm'

storiesOf('PinRegistrationForm', module).add('Default', () => (
  <PinRegistrationForm
    labels={{
      PinInput: {title: 'PinInput', subtitle: 'subtitle1', subtitle2: 'subtitle2'},
      PinConfirmationInput: {title: 'PinConfirmationInput', subtitle: 'subtitle1', subtitle2: 'subtitle2'},
    }}
    onPinEntered={action('onPinEntered')}
  />
))
