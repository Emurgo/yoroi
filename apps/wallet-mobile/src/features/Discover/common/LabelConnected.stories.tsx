import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {LabelConnected} from './LabelConnected'

storiesOf('Discover LabelConnected', module).add('initial', () => <Initial />)

const Initial = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <LabelConnected />
    </View>
  )
}
