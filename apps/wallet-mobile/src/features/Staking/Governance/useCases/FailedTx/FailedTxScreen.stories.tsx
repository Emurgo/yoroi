import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeArea} from '../../common'
import {FailedTxScreen} from './FailedTxScreen'

storiesOf('Governance/FailedTxScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('Default', () => <FailedTxScreen />)
