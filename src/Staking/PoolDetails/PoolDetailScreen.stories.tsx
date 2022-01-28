import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {PoolDetailScreen} from './PoolDetailScreen'

storiesOf('Pool Detail Screen', module).add('Default', () => (
  <PoolDetailScreen onPressDelegate={action('clicked')} disabled={false} />
))
