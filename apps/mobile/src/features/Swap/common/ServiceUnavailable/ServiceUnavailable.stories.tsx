import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ServiceUnavailable} from './ServiceUnavailable'

storiesOf('Service Unavailable', module)
  .addDecorator((getStory) => <View style={{...StyleSheet.absoluteFillObject}}>{getStory()}</View>)
  .add('initial', () => {
    return <ServiceUnavailable />
  })
