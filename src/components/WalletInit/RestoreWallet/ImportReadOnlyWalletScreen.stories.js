// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import ImportReadOnlyWalletScreen from './ImportReadOnlyWalletScreen'

storiesOf('ImportReadOnlyWalletScreen', module).add(
  'Default',
  ({navigation, route}) => (
    <ImportReadOnlyWalletScreen navigation={navigation} route={route} />
  ),
)
