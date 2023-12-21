import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ShowBuyBannerSmall} from './BuyBannerSmall'

storiesOf('RampOnOff ShowBuyBannerSmall', module) //
  .add('initial', () => <ShowBuyBannerSmall onClose={action('onClose')} />)
