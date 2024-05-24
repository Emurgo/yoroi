import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {BackgroundTimeout} from './backgroundTimeout'

storiesOf('useBackgroundTimeout', module).add('default', () => (
  <BackgroundTimeout onTimeout={action('onTimeout')} duration={5000} />
))
