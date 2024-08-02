import {storiesOf} from '@storybook/react-native'
import {ChainWarning} from './ChainWarning'
import * as React from 'react'

storiesOf('ChainWarning', module).add('Default', () => (
  <ChainWarning title="Test Title" description="Test Description" />
))
