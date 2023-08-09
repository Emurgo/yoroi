import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {BlueCheckbox} from './BlueCheckbox'
import {Text} from 'react-native'

storiesOf('BlueCheckbox', module)
  .add('Disabled', () => (
    <BlueCheckbox checked={false}>
      <Text>Click Me</Text>
    </BlueCheckbox>
  ))
  .add('Enabled', () => (
    <BlueCheckbox checked={true}>
      <Text>Click Me</Text>
    </BlueCheckbox>
  ))
