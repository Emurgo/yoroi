import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {BrowserToolbar} from './BrowserToolbar'

storiesOf('Discover BrowserToolbar', module).add('initial', () => <Initial />)

const Initial = () => {
  return <BrowserToolbar uri="https://www.google.com" />
}
