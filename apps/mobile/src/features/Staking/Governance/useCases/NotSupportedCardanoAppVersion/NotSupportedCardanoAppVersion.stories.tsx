import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeArea} from '../../../../../components/SafeArea'
import {NotSupportedCardanoAppVersion} from './NotSupportedCardanoAppVersion'

storiesOf('Governance/NotSupportedCardanoAppVersion', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('Default', () => <NotSupportedCardanoAppVersion />)
