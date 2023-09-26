import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowSubmittedTxScreen} from './ShowSubmittedTxScreen'

storiesOf('Submitted Tx Screen', module).add('initial', () => {
  return <ShowSubmittedTxScreen />
})
