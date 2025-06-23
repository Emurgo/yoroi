import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeArea} from '../../../../../components/SafeArea'
import {NoFundsScreen} from './NoFundsScreen'

storiesOf('Governance/NoFundsScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('Default', () => <NoFundsScreen />)
