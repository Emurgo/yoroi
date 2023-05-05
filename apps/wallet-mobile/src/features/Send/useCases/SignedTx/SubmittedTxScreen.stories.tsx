import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SubmittedTxScreen} from './SubmittedTxScreen'

storiesOf('Submitted Tx Screen', module).add('initial', () => {
  return <SubmittedTxScreen />
})
