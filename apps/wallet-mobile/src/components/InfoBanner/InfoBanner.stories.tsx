import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {InfoBanner} from './InfoBanner'

storiesOf('InfoBanner', module).add('initial', () => <Initial />)

const Initial = () => {
  return <InfoBanner content="Example info message" />
}
