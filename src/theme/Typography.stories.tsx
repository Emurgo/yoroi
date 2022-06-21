import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Text as RNText, TextProps, TextStyle, View} from 'react-native'

import {typography} from './typography'

storiesOf('Typography', module).add('default', () => <Typography />)

const Typography = () => {
  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <Table>
        {Object.entries(typography).map(([name, textStyle]) => (
          <Row key={name} title={name} textStyle={textStyle} />
        ))}
      </Table>
    </ScrollView>
  )
}

const Table: React.FC = ({children}) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 4,
        backgroundColor: 'white',
      }}
    >
      <Text style={{fontWeight: 'bold', alignSelf: 'center'}}>Name</Text>
      <View style={{padding: 4, flexDirection: 'column'}}>{children}</View>
    </View>
  )
}

const Row: React.FC<{title: string; textStyle: TextStyle}> = ({title, textStyle}) => {
  return (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      <Text style={[textStyle]}>{title.split('-').join(' ')}</Text>
    </View>
  )
}

const Text = (props: TextProps) => {
  return <RNText style={[props.style, {color: 'black'}]} {...props} />
}
