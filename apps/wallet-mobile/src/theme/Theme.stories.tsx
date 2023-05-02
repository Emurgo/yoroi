import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Switch, Text, View} from 'react-native'

import {Spacer} from '../components'
import {useTheme} from './ThemeProvider'

storiesOf('ThemeProvider', module).add('ThemeProvider', () => <ThemeGallery />)

const ThemeGallery = () => {
  const {theme, colorScheme, selectColorScheme} = useTheme()

  return (
    <>
      <View style={{justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16}}>
        <Text>colorScheme: {colorScheme}</Text>

        <Switch
          value={colorScheme === 'light'}
          onChange={() => selectColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
        />
      </View>

      <ScrollView contentContainerStyle={{padding: 16}}>
        <Text>Palette: {JSON.stringify(theme.color, null, 2)}</Text>

        <Spacer height={16} />

        <View style={{height: 1, backgroundColor: 'black'}} />

        <Spacer height={16} />

        <Text>Typography: {JSON.stringify(theme.typography, null, 2)}</Text>
      </ScrollView>
    </>
  )
}
