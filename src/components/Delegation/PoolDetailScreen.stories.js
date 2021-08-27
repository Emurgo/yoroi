// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import PoolDetailScreen from './PoolDetailScreen'

storiesOf('Pool Detail Screen', module).add('Default', () => (
  <PoolDetailScreen onPressDelegate={action('clicked')} disabled={false} />
))
