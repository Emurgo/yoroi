import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {CountDAppsAvailable} from './CountDAppsAvailable'

storiesOf('Discover CountDAppsAvailable', module).add('initial', () => <Initial />)

const Initial = () => {
  return <CountDAppsAvailable total={10} />
}
