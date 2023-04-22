import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {EmptySearchResult} from './EmptySearchResult'

storiesOf('Empty Search Result', module).add('initial', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <EmptySearchResult />
  </View>
))
