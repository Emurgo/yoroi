import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Text as RNText, TextProps, TextStyle, View} from 'react-native'

import {typography} from './typography'

storiesOf('Typography', module).add('default', () => <Typography />)

const Typography = () => {
  return (
    <ScrollView style={{backgroundColor: 'white'}} contentContainerStyle={{padding: 16}}>
      {Object.entries(typography).map(([name, textStyle]) => (
        <Row key={name} title={name} textStyle={textStyle} />
      ))}
    </ScrollView>
  )
}

const Row: React.FC<{title: string; textStyle: TextStyle}> = ({title, textStyle}) => {
  return (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      <Text style={textStyle}>{title.split('-').join(' ')}</Text>
    </View>
  )
}

const Text = ({style, ...props}: TextProps) => {
  return <RNText style={[style, {color: 'black'}]} {...props} />
}
