import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Alert, Text, View} from 'react-native'

import {ModalScreenWrapper} from './ModalScreenWrapper'

storiesOf('ModalScreenWrapper', module).add('initial', () => {
  return (
    <ModalScreenWrapper
      title="Title"
      height={300}
      onClose={() => {
        action('onClose')
        Alert.alert('onClose', 'Will it close?')
      }}
    >
      <View style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
        <Text>Body text</Text>
      </View>
    </ModalScreenWrapper>
  )
})
