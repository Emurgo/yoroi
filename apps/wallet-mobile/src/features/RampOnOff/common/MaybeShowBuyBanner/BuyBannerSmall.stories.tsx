import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {BuyBannerSmall} from './BuyBannerSmall'

storiesOf('RampOnOff BuyBannerSmall', module) //
  .add('initial', () => <BuyBannerSmall onClose={action('onClose')} />)
