import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native'

import {Spacer} from '../Spacer'
import {BottomSheet, BottomSheetRef} from './BottomSheet'

storiesOf('BottomSheet', module)
  .add('Default', () => <ComponentDefault />)
  .add('Scroll + input (Keyboard) + extendable', () => <ComponentWithScrollAndInput />)

const ComponentDefault = () => {
  const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const openBottomSheet = () => {
    bottomSheetRef.current?.openBottomSheet()
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.closeBottomSheet()
  }

  const handleClick = () => {
    if (bottomSheetRef.current?.isOpen) closeBottomSheet()
    else openBottomSheet()
  }

  return (
    <View style={{flex: 1}}>
      <Button title="click" onPress={handleClick} />

      <BottomSheet title="Fake Title" ref={bottomSheetRef} isExtendable={false}>
        <View style={{flex: 1, alignSelf: 'stretch', paddingHorizontal: 16}}>
          <Text style={{flex: 1}}>FAke content</Text>
        </View>
      </BottomSheet>
    </View>
  )
}

const ComponentWithScrollAndInput = () => {
  const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)

  const openBottomSheet = () => {
    bottomSheetRef.current?.openBottomSheet()
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.closeBottomSheet()
  }

  const handleClick = () => {
    if (bottomSheetRef.current?.isOpen) closeBottomSheet()
    else openBottomSheet()
  }

  return (
    <View style={{flex: 1}}>
      <Button title="click" onPress={handleClick} />

      <BottomSheet title="Fake Title" ref={bottomSheetRef}>
        <View style={{flex: 1, alignSelf: 'stretch', paddingHorizontal: 16}}>
          <ScrollView style={{flex: 1, alignSelf: 'stretch', borderColor: 'grey', borderWidth: 1}}>
            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>

            <Text style={{flex: 1}}>FAke content</Text>
          </ScrollView>

          <Spacer height={20} />

          <TextInput style={styles.input} placeholder="Fake input" />

          <Spacer height={20} />
        </View>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    alignSelf: 'stretch',
    height: 40,
    borderWidth: 1,
  },
})
