import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, Text, View} from 'react-native'

import {Spacer} from '..'
import * as Icon from '.'

storiesOf('Icon', module).add('Gallery', () => (
  <View style={{padding: 16}}>
    <Row>
      <Item icon={<Icon.Export size={40} />} title={'Export'} />
      <Item icon={<Icon.Magnify size={40} />} title={'Magnify'} />
      <Item icon={<Icon.Received />} title={'Received'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Sent />} title={'Sent'} />
      <Item icon={<Icon.WalletAccount iconSeed={'asdasd'} />} title={'WalletAccount'} />
      <Item icon={<Icon.Emurgo width={60} height={60} />} title={'Emurgo'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Check height={60} width={60} />} title={'Check'} />
      <Item mode={'dark'} icon={<Icon.YoroiWallet height={60} width={60} />} title={'YoroiWallet'} />
      <Item icon={<Icon.Cardano height={60} width={60} />} title={'Cardano'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Ada height={60} width={60} />} title={'AdaIcon'} />
      <Item icon={<Icon.RewardManuallyPayout height={60} width={60} />} title={'RewardManuallyPayout'} />
      <Item icon={<Icon.RewardWithdrawn height={60} width={60} />} title={'RewardWithdrawnIcon'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.StakingKeyDeregistered height={60} width={60} />} title={'StakingKeyDeregistered'} />
      <Item icon={<Icon.StakingKeyRegistered height={60} width={60} />} title={'StakingKeyRegistered'} />
      <Item icon={<Icon.Transaction height={60} width={60} />} title={'Transaction'} />
    </Row>
  </View>
))

const Row = (props) => (
  <View {...props} style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}} />
)

const Item = ({title, icon, mode = 'light'}: {title: string; icon: React.ReactElement; mode?: ColorSchemeName}) => {
  return (
    <View style={{borderWidth: 1, width: '25%', aspectRatio: 1}}>
      <View style={{alignItems: 'center', borderBottomWidth: 1}}>
        <Text numberOfLines={1} ellipsizeMode={'tail'}>
          {title}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: mode === 'dark' ? 'midnightblue' : 'white',
        }}
      >
        <View style={{borderWidth: 1, borderColor: 'red', borderStyle: 'dashed'}}>{icon}</View>
      </View>
    </View>
  )
}
