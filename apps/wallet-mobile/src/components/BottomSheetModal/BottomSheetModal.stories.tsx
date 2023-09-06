import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {BottomSheetModal} from './BottomSheetModal'

storiesOf('BottomSheetModal', module).add('Default', () => (
  <BottomSheetModal
    title="Fake Title"
    onClose={() => {
      action('onClose')
    }}
    isOpen
  >
    <View>
      <Text>FAke content</Text>
    </View>
  </BottomSheetModal>
))
