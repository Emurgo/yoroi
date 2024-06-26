import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {DAppCountConnectedSkeleton, DAppItemSkeleton, DAppTabSkeleton} from './DAppItemSkeleton'

storiesOf('Discover DAppItemSkeleton', module)
  .add('initial', () => <Initial />)
  .add('DApp Tab', () => <DAppTab />)
  .add('Count DApp Connected', () => <DAppCountConnected />)

const Initial = () => {
  return <DAppItemSkeleton />
}

const DAppTab = () => {
  return <DAppTabSkeleton />
}

const DAppCountConnected = () => {
  return <DAppCountConnectedSkeleton />
}
