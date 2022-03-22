import React from 'react'
import {TextStyle, View} from 'react-native'

import {Text} from './Text'

type Props = {
  textRow: string
  style?: TextStyle
}

export const BulletPointItem = ({textRow, style}: Props) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <Text style={style}>{'\u2022'}</Text>

      <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 8}}>
        <Text style={style}>{textRow}</Text>
      </View>
    </View>
  )
}
