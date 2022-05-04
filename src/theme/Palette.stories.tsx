import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {palette} from './palette'

storiesOf('Palette', module).add('Palette', () => <Palette />)

const Palette = () => {
  // const {colorScheme, selectColorScheme} = useTheme()

  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      {/* <Switch
        value={colorScheme === 'light'}
        onChange={() => selectColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
      /> */}
      {/* <Text>colorScheme: {colorScheme}</Text> */}

      <Section title="Grayscale">
        <Item title="max" color={palette['light'].gray.max} />
        <Item title="900" color={palette['light'].gray['900']} />
        <Item title="800" color={palette['light'].gray['800']} />
        <Item title="700" color={palette['light'].gray['700']} />
        <Item title="600" color={palette['light'].gray['600']} />
        <Item title="500" color={palette['light'].gray['500']} />
        <Item title="400" color={palette['light'].gray['400']} />
        <Item title="300" color={palette['light'].gray['300']} />
        <Item title="200" color={palette['light'].gray['200']} />
        <Item title="100" color={palette['light'].gray['100']} />
        <Item title="50" color={palette['light'].gray['50']} />
        <Item title="min" color={palette['light'].gray.min} />
      </Section>

      <Section title="Primary">
        <Item title="900" color={palette['light'].primary['900']} />
        <Item title="800" color={palette['light'].primary['800']} />
        <Item title="700" color={palette['light'].primary['700']} />
        <Item title="600" color={palette['light'].primary['600']} />
        <Item title="500" color={palette['light'].primary['500']} />
        <Item title="400" color={palette['light'].primary['400']} />
        <Item title="300" color={palette['light'].primary['300']} />
        <Item title="200" color={palette['light'].primary['200']} />
        <Item title="100" color={palette['light'].primary['100']} />
      </Section>

      <Section title="Secondary">
        <Item title="900" color={palette['light'].secondary['900']} />
        <Item title="800" color={palette['light'].secondary['800']} />
        <Item title="700" color={palette['light'].secondary['700']} />
        <Item title="600" color={palette['light'].secondary['600']} />
        <Item title="500" color={palette['light'].secondary['500']} />
        <Item title="400" color={palette['light'].secondary['400']} />
        <Item title="300" color={palette['light'].secondary['300']} />
        <Item title="200" color={palette['light'].secondary['200']} />
        <Item title="100" color={palette['light'].secondary['100']} />
      </Section>

      <Section title="Magenta">
        <Item title="500" color={palette['light'].magenta['500']} />
        <Item title="300" color={palette['light'].magenta['300']} />
        <Item title="100" color={palette['light'].magenta['100']} />
      </Section>

      <Section title="Cyan">
        <Item title="400" color={palette['light'].cyan['400']} />
        <Item title="100" color={palette['light'].cyan['100']} />
      </Section>

      <Section title="Gradients">
        <Gradient title="blue-green" colors={palette['light'].gradients['blue-green']} />
        <Gradient title="green" colors={palette['light'].gradients['blue']} />
        <Gradient title="blue" colors={palette['light'].gradients['green']} />
      </Section>
    </ScrollView>
  )
}

const Section: React.FC<{title: string}> = ({title, children}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', padding: 4, borderWidth: 1}}>
      <Text style={{fontWeight: 'bold'}}>{title}</Text>
      <View style={{padding: 4, flexDirection: 'row', flexWrap: 'wrap'}}>{children}</View>
    </View>
  )
}

const Item: React.FC<{title: string; color: string}> = ({title, color}) => {
  return (
    <View style={{alignItems: 'center'}}>
      <Text>{title}</Text>
      <Text>{color}</Text>
      <View style={{backgroundColor: color, height: 100, width: 100}} />
    </View>
  )
}

const Gradient: React.FC<{title: string; colors: [string, string]}> = ({title, colors}) => {
  return (
    <View style={{alignItems: 'center'}}>
      <Text>{title}</Text>
      <Text>{colors[0]}</Text>
      <LinearGradient colors={colors} style={{height: 100, width: 100}} />
      <Text>{colors[1]}</Text>
    </View>
  )
}
