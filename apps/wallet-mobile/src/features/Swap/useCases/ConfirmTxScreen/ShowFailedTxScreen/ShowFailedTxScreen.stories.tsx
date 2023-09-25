import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowFailedTxScreen} from './ShowFailedTxScreen'

storiesOf('Submitted Tx Screen', module).add('initial', () => {
  return <ShowFailedTxScreen />
})
