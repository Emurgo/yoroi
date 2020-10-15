// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import SaveNanoXScreen from './SaveNanoXScreen'

storiesOf('SaveNanoXScreen', module).add('default', ({navigation}) => (
  <SaveNanoXScreen
    navigation={navigation}
    onPress={(_e) => action('clicked')}
  />
))
