import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, Text, View} from 'react-native'

import {BottomSheet, DialogRef} from './BottomSheet'

storiesOf('BottomSheet', module).add('Default', () => <ComponentDefault />)

const ComponentDefault = () => {
  const dialog = React.useRef<null | DialogRef>(null)

  const openDialog = () => {
    dialog.current?.openDialog()
  }

  const closeDialog = () => {
    dialog.current?.closeDialog()
  }

  const handleClick = () => {
    if (dialog.current?.isOpen) closeDialog()
    else openDialog()
  }

  return (
    <View style={{flex: 1}}>
      <Button title="click" onPress={handleClick} />

      <BottomSheet title="Fake Title" ref={dialog}>
        <View style={{flex: 1, alignSelf: 'stretch', paddingHorizontal: 16}}>
          <Text style={{flex: 1}}>Content</Text>
        </View>
      </BottomSheet>
    </View>
  )
}
