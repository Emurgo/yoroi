import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {Switch, Text, View} from 'react-native'

import {useTheme} from './ThemeProvider'

storiesOf('ThemeProvider', module).add('ThemeProvider', () => <ThemeGallery />)

const ThemeGallery = () => {
  const {theme, colorScheme, selectColorScheme} = useTheme()

  return (
    <View>
      <Switch
        value={colorScheme === 'light'}
        onChange={() => selectColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
      />
      <Text>colorScheme: {colorScheme}</Text>
      <Text>theme: {JSON.stringify(theme, null, 2)}</Text>

      <Section title="Grayscale">
        <Item title="gray-max" color={theme.gray.max} />
      </Section>
    </View>
  )
}

const Section: React.FC<{title: string}> = ({title, children}) => {
  return (
    <View>
      <Text>{title}</Text>
      {children}
    </View>
  )
}

const Item: React.FC<{title: string; color: string}> = ({title, color}) => {
  return (
    <View>
      <Text>{title}</Text>
      <View style={{backgroundColor: color}} />
    </View>
  )
}
