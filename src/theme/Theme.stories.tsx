import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Switch, Text} from 'react-native'

import {useTheme} from './ThemeProvider'

storiesOf('ThemeProvider', module).add('ThemeProvider', () => <ThemeGallery />)

const ThemeGallery = () => {
  const {theme, colorScheme, selectColorScheme} = useTheme()

  return (
    <ScrollView>
      <Switch
        value={colorScheme === 'light'}
        onChange={() => selectColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
      />
      <Text>colorScheme: {colorScheme}</Text>
      <Text>theme: {JSON.stringify(theme, null, 2)}</Text>
    </ScrollView>
  )
}
