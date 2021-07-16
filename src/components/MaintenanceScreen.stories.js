// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import MaintenanceScreen from './MaintenanceScreen'

storiesOf('Maintenance Screen', module).add(
  'default',
  ({route, navigation}) => (
    <MaintenanceScreen route={route} navigation={navigation} />
  ),
)
