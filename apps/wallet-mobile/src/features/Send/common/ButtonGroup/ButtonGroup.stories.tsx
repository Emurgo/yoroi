import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonGroup} from './ButtonGroup'

const WithInitial = ({initial}: {initial: number}) => {
  const handleActive = (index: number, label: string) => {
    action(`onSelect ${index}:${label}`)
  }
  return (
    <View>
      <ButtonGroup<string> labels={['label1', 'label2']} onSelect={handleActive} initial={initial} />
    </View>
  )
}

const NoInitial = () => {
  const handleActive = (index: number, label: string) => {
    action(`onSelect ${index}:${label}`)
  }
  return (
    <View>
      <ButtonGroup<string> labels={Array.from({length: 10}, () => Math.random().toString())} onSelect={handleActive} />
    </View>
  )
}

storiesOf('Send ButtonGroup', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('label 1 inital', () => <WithInitial initial={0} />)
  .add('label 2 initial', () => <WithInitial initial={1} />)
  .add('many options', () => <NoInitial />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
