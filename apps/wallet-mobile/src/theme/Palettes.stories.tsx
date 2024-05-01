import {storiesOf} from '@storybook/react-native'
import {StorybookBasePalette} from '@yoroi/theme'
import React from 'react'

storiesOf('Theme Palettes', module).add('base', () => {
  return <StorybookBasePalette />
})
