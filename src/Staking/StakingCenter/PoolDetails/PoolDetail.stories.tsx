import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {PoolDetails} from './PoolDetails'

storiesOf('Pool Details', module).add('Default', () => (
  <PoolDetails onPressDelegate={action('onPressDelegate')} disabled={false} />
))
