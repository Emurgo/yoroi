import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {Text} from 'react-native'

import {ScreenBackground} from '../ScreenBackground'
import {ErrorPanel} from './ErrorPanel'

storiesOf('Components/ErrorPanel', module).add('with error message', () => (
  <ScreenBackground style={{padding: 16, backgroundColor: 'white'}}>
    <ErrorPanel>
      <Text>10 assets are the maximum number allowed to send in one transaction</Text>
    </ErrorPanel>
  </ScreenBackground>
))
