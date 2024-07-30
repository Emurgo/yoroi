import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowPreprodNoticeScreen} from './ShowPreprodNoticeScreen'

storiesOf('Swap Preprod Notice Screen', module).add('initial', () => {
  return <ShowPreprodNoticeScreen />
})
