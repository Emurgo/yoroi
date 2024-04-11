import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {DAppItemSkeleton} from './DAppItemSkeleton'

storiesOf('Discover DAppItemSkeleton', module).add('initial', () => <Initial />)

const Initial = () => {
  return <DAppItemSkeleton />
}
