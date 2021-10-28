// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {MnemonicInput} from './MnemonicInput'

storiesOf('MnemonicInput', module).add('Default', () => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <MnemonicInput length={15} onDone={action('onDone')} />
  </View>
))
