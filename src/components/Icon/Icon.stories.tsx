import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import * as Icon from './Icon'

storiesOf('Icon', module).add('size={40}', () => (
  <>
    <Text>Magnify</Text>
    <Icon.Magnify size={40} />

    <Text>Export</Text>
    <Icon.Export size={40} />
  </>
))
