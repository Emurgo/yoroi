import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SafeAreaInsets} from '../../../../.storybook'
import {TermsOfServiceChangedScreen} from './TermsOfServiceChangedScreen'

storiesOf('TermsOfServiceChangedScreen', module).add('Default', () => (
  <SafeAreaInsets>
    <TermsOfServiceChangedScreen />
  </SafeAreaInsets>
))
