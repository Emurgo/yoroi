import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {LabelSingleAddress} from './LabelSingleAddress'

storiesOf('Discover LabelSingleAddress', module).add('initial', () => <Initial />)

const Initial = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <LabelSingleAddress />
    </View>
  )
}
