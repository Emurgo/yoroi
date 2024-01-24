import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {BlueCheckbox} from './BlueCheckbox'

storiesOf('BlueCheckbox', module)
  .add('Disabled', () => (
    <BlueCheckbox checked={false}>
      <Text>Click Me</Text>
    </BlueCheckbox>
  ))
  .add('Enabled', () => (
    <BlueCheckbox checked>
      <Text>Click Me</Text>
    </BlueCheckbox>
  ))
