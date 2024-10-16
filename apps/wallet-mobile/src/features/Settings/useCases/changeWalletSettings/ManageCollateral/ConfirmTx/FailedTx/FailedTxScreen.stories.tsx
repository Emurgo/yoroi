import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {FailedTxScreen} from './FailedTxScreen'

storiesOf('Settings/Failed Tx Screen', module).add('initial', () => {
  return <FailedTxScreen />
})
