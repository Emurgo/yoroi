import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TRampOnOffAction} from '../RampOnOffProvider'
import {ButtonActionGroup} from './ButtonActionGroup'

const Label1Selected = ({initial}: {initial: TRampOnOffAction}) => {
  const [selected, setSelected] = React.useState(initial)
  const handleActive = (label: TRampOnOffAction) => {
    action(`onSelect ${label}`)
    setSelected(label)
  }
  const labels: {label: string; value: TRampOnOffAction}[] = [
    {label: 'Sell ADA', value: 'sell'},
    {label: 'Buy ADA', value: 'buy'},
  ]
  return (
    <View>
      <ButtonActionGroup labels={labels} onSelect={handleActive} selected={selected} />
    </View>
  )
}

storiesOf('ButtonGroupRampOnOff', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('label sell selected', () => <Label1Selected initial="sell" />)
  .add('label buy selected', () => <Label1Selected initial="buy" />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
