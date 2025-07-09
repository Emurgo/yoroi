import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Analytics} from './Analytics'

storiesOf('Analytics', module)
  .add('Notice', () => <Analytics type="notice" />)
  .add('Settings', () => <Analytics type="settings" />)
