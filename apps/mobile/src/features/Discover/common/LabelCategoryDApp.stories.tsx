import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {LabelCategoryDApp} from './LabelCategoryDApp'

storiesOf('Discover LabelCategoryDApp', module).add('initial', () => <Initial />)

const Initial = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <LabelCategoryDApp category="media" />
    </View>
  )
}
