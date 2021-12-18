import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {AmountField} from './AmountField'

storiesOf('AmountField', module)
  .add('Default', () => {
    return <AmountField amount={'123'} setAmount={action('setAmount')} />
  })
  .add('disabled', () => {
    return <AmountField amount={'123'} setAmount={action('setAmount')} editable={false} />
  })
  .add('with error', () => {
    return <AmountField amount={'123'} setAmount={action('setAmount')} error={'error message'} />
  })
