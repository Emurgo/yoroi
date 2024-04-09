import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {DAppExplorerTabItem} from './DAppExplorerTabItem'

storiesOf('Discover DAppExplorerTabItem', module)
  .add('connected', () => <Connected />)
  .add('recommended', () => <Recommended />)

const Connected = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <DAppExplorerTabItem name="Connected" isActive={true} onPress={action('onPress')} />
    </View>
  )
}

const Recommended = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <DAppExplorerTabItem name="Recommended" isActive={true} onPress={action('onPress')} />
    </View>
  )
}
