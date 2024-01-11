import {storiesOf} from '@storybook/react-native'
import {Analytics} from '@yoroi/wallet-mobile/src/components/Analytics'
import React from 'react'

storiesOf('Analytics', module)
  .add('Notice', () => <Analytics type="notice" />)
  .add('Settings', () => <Analytics type="settings" />)
