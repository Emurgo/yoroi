import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {PnlTag} from './PnlTag'

storiesOf('Discover PnlTag', module).add('initial', () => <Initial />)

const Initial = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <PnlTag variant="danger" />
    </View>
  )
}
