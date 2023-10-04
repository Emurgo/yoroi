import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, Text, View} from 'react-native'

import {BottomSheet, DialogRef} from './BottomSheet'

storiesOf('BottomSheet', module).add('Default', () => <ComponentDefault />)

const ComponentDefault = () => {
  const dialogRef = React.useRef<null | DialogRef>(null)

  const openDialog = () => {
    dialogRef.current?.openDialog()
  }

  const closeDialog = () => {
    dialogRef.current?.closeDialog()
  }

  const handleClick = () => {
    if (dialogRef.current?.isOpen) closeDialog()
    else openDialog()
  }

  return (
    <View style={{flex: 1}}>
      <Button title="click" onPress={handleClick} />

      <BottomSheet title="Fake Title" ref={dialogRef}>
        <View style={{flex: 1, alignSelf: 'stretch', paddingHorizontal: 16}}>
          <Text style={{flex: 1}}>Content</Text>
        </View>
      </BottomSheet>
    </View>
  )
}
