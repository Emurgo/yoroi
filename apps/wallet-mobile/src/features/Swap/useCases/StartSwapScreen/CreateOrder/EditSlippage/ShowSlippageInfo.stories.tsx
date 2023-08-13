import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowSlippageInfo} from './ShowSlippageInfo'

storiesOf('Swap Show Slippage Info', module).add('initial', () => {
  return <ShowSlippageInfo />
})
