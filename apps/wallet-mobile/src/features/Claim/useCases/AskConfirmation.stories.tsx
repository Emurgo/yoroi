import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {AskConfirmation, AskConfirmationActions} from './AskConfirmation'

storiesOf('AskConfirmation', module).add('initial', () => {
  return (
    <>
      <AskConfirmation address="address" url="https://example.com" code="42" />

      <AskConfirmationActions onContinue={action('onContinue')} />
    </>
  )
})
