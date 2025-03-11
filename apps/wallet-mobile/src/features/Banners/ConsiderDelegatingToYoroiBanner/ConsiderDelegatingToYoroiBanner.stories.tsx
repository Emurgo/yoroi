import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ConsiderDelegatingToYoroiBanner} from './ConsiderDelegatingToYoroiBanner'

storiesOf('components/ConsiderDelegatingToYoroiBanner', module)
  .add('Default', () => <ConsiderDelegatingToYoroiBanner onPress={action('onPress')} />)
  .add('With Close Button', () => (
    <ConsiderDelegatingToYoroiBanner onPress={action('onPress')} onClose={action('onClose')} />
  ))
