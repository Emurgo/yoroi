import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeArea} from '../../common'
import {SuccessTxScreen} from './SuccessTxScreen'

storiesOf('Governance/SuccessTxScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('Default', () => <SuccessTxScreen />)
