import * as React from 'react'
import {ScrollView, Switch, Text, View} from 'react-native'

import {useTheme} from '../ThemeProvider'

export const StorybookTheme = () => {
  const {theme, colorScheme, selectColorScheme} = useTheme()

  return (
    <>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Text>colorScheme: {colorScheme}</Text>

        <Switch
          value={colorScheme === 'light'}
          onChange={() =>
            selectColorScheme(colorScheme === 'light' ? 'dark' : 'light')
          }
        />
      </View>

      <ScrollView contentContainerStyle={{padding: 16}}>
        <Text>Palette: {JSON.stringify(theme.color, null, 2)}</Text>

        <View style={{height: 1, backgroundColor: 'black'}} />

        <Text>Typography: {JSON.stringify(theme.typography, null, 2)}</Text>
      </ScrollView>
    </>
  )
}
