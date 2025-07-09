import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {Checkbox} from './Checkbox'

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
  .addDecorator((getStory) => (
    <View
      style={{
        padding: 16,
        justifyContent: 'center',
        flex: 1,
      }}
    >
      {getStory()}
    </View>
  ))
  .add('default', () => <CheckboxWrapper />)
