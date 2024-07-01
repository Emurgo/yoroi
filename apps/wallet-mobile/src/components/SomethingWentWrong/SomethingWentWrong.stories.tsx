import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SomethingWentWrong} from './SomethingWentWrong'

storiesOf('SomethingWentWrong', module).add('Default', () => (
  <SomethingWentWrong error={new Error('Test Error')} resetErrorBoundary={action('resetErrorBoundary')} />
))
