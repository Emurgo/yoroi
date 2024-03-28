import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {ExchangeErrorScreen} from './ExchangeErrorScreen'

storiesOf('Exchange Error Screen', module).add('Default', () => {
  return <ExchangeErrorScreen />
})
