import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {AddToken} from './AddToken'

storiesOf('Send/ListSelectedTokens/AddToken', module).add('Default', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <AddToken onPress={() => action(`onPress address`)} />
  </View>
))
