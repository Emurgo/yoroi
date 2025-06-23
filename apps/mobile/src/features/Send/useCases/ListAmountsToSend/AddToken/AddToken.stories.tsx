import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {AddTokenButton} from './AddToken'

storiesOf('Add Token Button', module).add('initial', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <AddTokenButton onPress={() => action(`onPress`)} />
  </View>
))
