import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {View} from 'react-native'

import {SimpleTab} from './SimpleTab'

storiesOf('SimpleTab', module)
  .add('Active', () => <Active />)
  .add('Inactive', () => <Inactive />)

const Active = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <SimpleTab name="Active" isActive={true} onPress={action('onPress')} />
    </View>
  )
}

const Inactive = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <SimpleTab name="Inactive" isActive={false} onPress={action('onPress')} />
    </View>
  )
}
