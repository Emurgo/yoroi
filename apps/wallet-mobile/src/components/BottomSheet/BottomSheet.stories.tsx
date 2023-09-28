import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, Text, View} from 'react-native'

import {BottomSheet, BottomSheetRef} from './BottomSheet'

storiesOf('BottomSheet', module).add('Default', () => <ComponentDefault />)

const ComponentDefault = () => {
  const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const openDialog = () => {
    bottomSheetRef.current?.openDialog()
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.closeBottomSheet()
  }

  const handleClick = () => {
    if (bottomSheetRef.current?.isOpen) closeBottomSheet()
    else openDialog()
  }

  return (
    <View style={{flex: 1}}>
      <Button title="click" onPress={handleClick} />

      <BottomSheet title="Fake Title" ref={bottomSheetRef}>
        <View style={{flex: 1, alignSelf: 'stretch', paddingHorizontal: 16}}>
          <Text style={{flex: 1}}>Content</Text>
        </View>
      </BottomSheet>
    </View>
  )
}
