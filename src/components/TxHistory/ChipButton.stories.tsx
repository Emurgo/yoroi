import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Alert} from 'react-native'

import {ChipButton} from './ChipButton'

storiesOf('V2/TxHistory/ChipButton', module)
  .add('Selected', () => <ChipButton isSelected onPress={() => Alert.alert('onPress', 'message')} label="Selected" />)
  .add('Not selected', () => <ChipButton onPress={() => Alert.alert('onPress', 'message')} label="Default" />)
  .add('Disabled', () => <ChipButton disabled onPress={() => Alert.alert('onPress', 'message')} label="Disabled" />)
