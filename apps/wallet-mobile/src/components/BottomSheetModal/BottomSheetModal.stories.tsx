import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Alert, Text, View} from 'react-native'

import {BottomSheetModal} from './BottomSheetModal'

storiesOf('BottomSheetModal', module).add('Default', () => (
  <BottomSheetModal
    content={
      <View>
        <Text>FAke content</Text>
      </View>
    }
    title="Fake Title"
    onClose={() => {
      Alert.alert('on Close clicked')
    }}
    isOpen
  />
))
