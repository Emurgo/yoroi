import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ChipButton} from './ChipButton'

storiesOf('V2/TxHistory/ChipButton', module)
  .add('Selected', () => <ChipButton selected onPress={action('onPress')} label="Selected" />)
  .add('Not selected', () => <ChipButton onPress={action('onPress')} label="Default" />)
  .add('Disabled', () => <ChipButton disabled onPress={action('onPress')} label="Disabled" />)
