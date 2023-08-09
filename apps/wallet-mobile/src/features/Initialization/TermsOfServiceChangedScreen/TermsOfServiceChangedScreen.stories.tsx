import {storiesOf} from '@storybook/react-native'
import {SafeAreaInsets} from '../../../../.storybook'
import React from 'react'
import {TermsOfServiceChangedScreen} from './TermsOfServiceChangedScreen'

storiesOf('TermsOfServiceChangedScreen', module).add('Default', () => (
  <SafeAreaInsets>
    <TermsOfServiceChangedScreen />
  </SafeAreaInsets>
))
