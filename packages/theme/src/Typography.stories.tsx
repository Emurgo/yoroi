/* eslint-disable react-native/no-inline-styles */
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {typography} from './typography'

storiesOf('Typography', module).add('default', () => <Typography />)

const Typography = () => {
  return (
    <ScrollView
      style={{backgroundColor: 'white'}}
      contentContainerStyle={{padding: 16}}
    >
      {Object.entries(typography).map(([name, textStyle]) => {
        const title = name.split('-').join(' ')

        return (
          <Row key={name}>
            <Text style={[textStyle, {color: 'black'}]}>{title}</Text>
          </Row>
        )
      })}
    </ScrollView>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  return (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>{children}</View>
  )
}
