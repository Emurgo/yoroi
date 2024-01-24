import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CodeScannerButton} from './CodeScannerButton'

storiesOf('CodeScannerButton', module)
  .add('initial', () => {
    return <CodeScannerButton />
  })
  .add('with size', () => {
    return <CodeScannerButton size={60} />
  })
  .add('with color', () => {
    return <CodeScannerButton color="red" />
  })
  .add('example disabled', () => {
    return <CodeScannerButton color="gray" disabled />
  })
  .add('example onPress', () => {
    return <CodeScannerButton onPress={action('onPress()')} />
  })
