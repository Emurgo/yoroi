import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {YoroiLogo} from './YoroiLogo'

storiesOf('YoroiLogo', module)
  .addDecorator((story) => (
    <View
      style={{
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {story()}
    </View>
  ))
  .add('Default', () => <YoroiLogo />)
