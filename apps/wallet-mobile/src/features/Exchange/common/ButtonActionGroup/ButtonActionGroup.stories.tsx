import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {OrderType} from '@yoroi/exchange'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonActionGroup} from './ButtonActionGroup'

storiesOf('Exchange ButtonActionGroup', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('sell selected', () => <Label1Selected initial="sell" />)
  .add('buy selected', () => <Label1Selected initial="buy" />)

const Label1Selected = ({initial}: {initial: OrderType}) => {
  const [selected, setSelected] = React.useState(initial)
  const handleActive = (label: OrderType) => {
    action(`onSelect ${label}`)
    setSelected(label)
  }

  return <ButtonActionGroup labels={labels} onSelect={handleActive} selected={selected} />
}

const labels: {label: string; value: OrderType}[] = [
  {label: 'Sell ADA', value: 'sell'},
  {label: 'Buy ADA', value: 'buy'},
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
