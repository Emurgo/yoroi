import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {ScreenBackground} from '../ScreenBackground'
import {ErrorPanel} from './ErrorPanel'

storiesOf('Components/ErrorPanel', module).add('with error message', () => (
  <ScreenBackground style={{padding: 16, backgroundColor: 'white'}}>
    <ErrorPanel message="10 assets are the maximum number allowed to send in one transaction" />
  </ScreenBackground>
))
