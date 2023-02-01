import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Switch, Text as RNText, TextProps, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {darkPalette, lightPalette} from './palettes'

storiesOf('Palette', module).add('Palette', () => <WithColorScheme />)

const Palette = () => {
  const [colorScheme, setColorScheme] = useColorScheme()
  const palette = colorScheme === 'dark' ? darkPalette : lightPalette

  return (
    <ScrollView style={[{flex: 1}, colorScheme === 'dark' ? {backgroundColor: 'black'} : {backgroundColor: 'white'}]}>
      <View style={{flex: 1, flexDirection: 'row', padding: 8, alignItems: 'center', justifyContent: 'flex-start'}}>
        <Text>colorScheme: {colorScheme}</Text>

        <View style={{width: 8}} />

        <Switch
          trackColor={{false: palette.primary[500], true: palette.secondary[500]}}
          ios_backgroundColor={palette.primary[500]}
          value={colorScheme === 'light'}
          onChange={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
        />
      </View>

      <Section title="Grayscale">
        <Item title="max" color={palette.gray.max} />

        <Item title="900" color={palette.gray['900']} />

        <Item title="800" color={palette.gray['800']} />

        <Item title="700" color={palette.gray['700']} />

        <Item title="600" color={palette.gray['600']} />

        <Item title="500" color={palette.gray['500']} />

        <Item title="400" color={palette.gray['400']} />

        <Item title="300" color={palette.gray['300']} />

        <Item title="200" color={palette.gray['200']} />

        <Item title="100" color={palette.gray['100']} />

        <Item title="50" color={palette.gray['50']} />

        <Item title="min" color={palette.gray.min} />
      </Section>

      <Section title="Primary">
        <Item title="900" color={palette.primary['900']} />

        <Item title="800" color={palette.primary['800']} />

        <Item title="700" color={palette.primary['700']} />

        <Item title="600" color={palette.primary['600']} />

        <Item title="500" color={palette.primary['500']} />

        <Item title="400" color={palette.primary['400']} />

        <Item title="300" color={palette.primary['300']} />

        <Item title="200" color={palette.primary['200']} />

        <Item title="100" color={palette.primary['100']} />
      </Section>

      <Section title="Secondary">
        <Item title="900" color={palette.secondary['900']} />

        <Item title="800" color={palette.secondary['800']} />

        <Item title="700" color={palette.secondary['700']} />

        <Item title="600" color={palette.secondary['600']} />

        <Item title="500" color={palette.secondary['500']} />

        <Item title="400" color={palette.secondary['400']} />

        <Item title="300" color={palette.secondary['300']} />

        <Item title="200" color={palette.secondary['200']} />

        <Item title="100" color={palette.secondary['100']} />
      </Section>

      <Section title="Magenta">
        <Item title="500" color={palette.magenta['500']} />

        <Item title="300" color={palette.magenta['300']} />

        <Item title="100" color={palette.magenta['100']} />
      </Section>

      <Section title="Cyan">
        <Item title="400" color={palette.cyan['400']} />

        <Item title="100" color={palette.cyan['100']} />
      </Section>

      <Section title="Gradients">
        <Gradient title="blue-green" colors={palette.gradients['blue-green']} />

        <Gradient title="blue" colors={palette.gradients['blue']} />

        <Gradient title="green" colors={palette.gradients['green']} />
      </Section>
    </ScrollView>
  )
}

const Section = ({title, children}: {title: string; children: React.ReactNode}) => {
  const [colorScheme] = useColorScheme()

  return (
    <View
      style={[
        {flex: 1, alignItems: 'center', padding: 4, borderWidth: 1},
        colorScheme === 'dark'
          ? {backgroundColor: 'black', borderColor: 'white'}
          : {backgroundColor: 'white', borderColor: 'black'},
      ]}
    >
      <Text style={{fontWeight: 'bold'}}>{title}</Text>

      <View style={{padding: 4, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>{children}</View>
    </View>
  )
}

const Item = ({title, color}: {title: string; color: string}) => {
  return (
    <View style={{alignItems: 'center'}}>
      <Text>{title}</Text>

      <Text>{color}</Text>

      <View style={{backgroundColor: color, height: 100, width: 100}} />
    </View>
  )
}

const Gradient = ({title, colors}: {title: string; colors: [string, string]}) => {
  return (
    <View style={{alignItems: 'center'}}>
      <Text>{title}</Text>

      <Text>{colors[0]}</Text>

      <LinearGradient colors={colors} style={{height: 100, width: 100}} />

      <Text>{colors[1]}</Text>
    </View>
  )
}

const Text = (props: TextProps) => {
  const [colorScheme] = useColorScheme()

  return <RNText style={[props.style, colorScheme === 'dark' ? {color: 'white'} : {color: 'black'}]} {...props} />
}

const ColorSchemeContext = React.createContext<undefined | ['light' | 'dark', (colorScheme: 'light' | 'dark') => void]>(
  undefined,
)
const WithColorScheme = () => {
  return (
    <ColorSchemeContext.Provider value={React.useState<'light' | 'dark'>('light')}>
      <Palette />
    </ColorSchemeContext.Provider>
  )
}
const useColorScheme = () => {
  const context = React.useContext(ColorSchemeContext)
  if (!context) {
    throw new Error('Missing ColorSchemeContext')
  }

  return context
}
