import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Checkbox} from './Checkbox'

const styles = StyleSheet.create({
  checkbox: {
    padding: 16,
    justifyContent: 'center',
    flex: 1,
  },
})

const CheckboxWrapper = () => {
  const [checked, setChecked] = React.useState(false)

  return (
    <Checkbox
      text={checked ? 'this is the checked text' : 'this is the unchecked text'}
      checked={checked}
      onChange={(value) => {
        action('checked')(value)
        setChecked(value)
      }}
    />
  )
}

storiesOf('Checkbox', module)
  .addDecorator((getStory) => <View style={styles.checkbox}>{getStory()}</View>)
  .add('default', () => <CheckboxWrapper />)
