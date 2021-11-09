import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {Spacer} from '..'
import * as Icon from './Icon'
import {ReceivedIcon} from './ReceivedIcon'
import {SentIcon} from './SentIcon'
import {WalletAccountIcon} from './WalletAccountIcon'

storiesOf('Icon', module).add('default', () => (
  <View style={{padding: 16}}>
    <Row>
      <Item icon={<Icon.Export />} title={'Export'} />
      <Item icon={<Icon.Magnify />} title={'Magnify'} />
      <Item icon={<ReceivedIcon />} title={'Received'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<SentIcon />} title={'Sent'} />
      <Item icon={<WalletAccountIcon iconSeed={'asdasd'} />} title={'WalletAccount'} />
    </Row>
  </View>
))

const Row = (props) => (
  <View {...props} style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}} />
)

const Item = ({title, icon}: {title: string; icon: React.ReactElement}) => {
  return (
    <View style={{borderWidth: 1, width: '25%', aspectRatio: 1}}>
      <View style={{alignItems: 'center', borderBottomWidth: 1}}>
        <Text numberOfLines={1} ellipsizeMode={'tail'}>
          {title}
        </Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <View style={{borderWidth: 1, borderColor: 'red', borderStyle: 'dashed'}}>{icon}</View>
      </View>
    </View>
  )
}
