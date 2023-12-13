import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ModalProvider} from '../../../components'
import DescribeAction from './DescribeAction'

storiesOf('DescribeAction For rampOnOff', module).add('Default', () => (
  <ModalProvider>
    <DescribeAction />
  </ModalProvider>
))
