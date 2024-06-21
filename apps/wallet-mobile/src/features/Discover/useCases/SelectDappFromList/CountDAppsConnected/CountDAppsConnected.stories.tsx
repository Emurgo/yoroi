import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {CountDAppsConnected} from './CountDAppsConnected'

storiesOf('Discover CountDAppsConnected', module).add('initial', () => <Initial />)

const Initial = () => {
  return <CountDAppsConnected total={10} />
}
