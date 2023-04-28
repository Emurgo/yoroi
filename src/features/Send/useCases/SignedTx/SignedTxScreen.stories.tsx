import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SignedTxScreen} from './SignedTxScreen'

storiesOf('Signed Tx Screen', module).add('initial', () => {
  return <SignedTxScreen />
})
