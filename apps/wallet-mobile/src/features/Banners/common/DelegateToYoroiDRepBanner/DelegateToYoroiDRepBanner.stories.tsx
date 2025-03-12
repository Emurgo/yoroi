import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {DelegateToYoroiDRepBanner} from './DelegateToYoroiDRepBanner'

storiesOf('DelegateToYoroiDRepBanner', module).add('Initial', () => (
  <DelegateToYoroiDRepBanner isVisible onDismiss={action('onDismiss')} />
))
