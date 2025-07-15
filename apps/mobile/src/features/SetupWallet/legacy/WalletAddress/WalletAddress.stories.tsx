import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {WalletAddress} from './WalletAddress'

storiesOf('WalletAddress', module)
  .addDecorator((story) => (
    <View style={[{flex: 1, padding: 16, justifyContent: 'center'}]}>
      {story()}
    </View>
  ))
  .add('Default', () => <WalletAddress addressHash="addressHash" />)
