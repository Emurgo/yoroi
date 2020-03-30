// @flow

import React from 'react'
import {ScrollView} from 'react-native'
import {storiesOf} from '@storybook/react-native'

import TermsOfService from './TermsOfService'

storiesOf('Terms of Service', module)
  .add('default', () => (
    <ScrollView><TermsOfService /></ScrollView>
  ))
