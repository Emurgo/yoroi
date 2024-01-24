import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonGroup} from './ButtonGroup'

const Label1Selected = ({initial}: {initial: number}) => {
  const [selected, setSelected] = React.useState(initial)
  const handleActive = (index: number) => {
    action(`onSelect ${index}`)
    setSelected(index)
  }
  return (
    <View>
      <ButtonGroup labels={['label1', 'label2']} onSelect={handleActive} selected={selected} />
    </View>
  )
}

const ManyOptions = ({initial}: {initial: number}) => {
  const [selected, setSelected] = React.useState(initial)
  const handleActive = (index: number) => {
    action(`onSelect ${index}`)
    setSelected(index)
  }
  return (
    <View>
      <ButtonGroup
        labels={Array.from({length: 10}, () => Math.random().toString())}
        onSelect={handleActive}
        selected={selected}
      />
    </View>
  )
}

storiesOf('ButtonGroup', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('label 1 selected', () => <Label1Selected initial={0} />)
  .add('label 2 selected', () => <Label1Selected initial={1} />)
  .add('many options', () => <ManyOptions initial={0} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
