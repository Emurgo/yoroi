import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, ScrollView, Text, View} from 'react-native'

import {Icon, Spacer} from '..'

storiesOf('Icon', module).add('Gallery', () => (
  <ScrollView contentContainerStyle={{padding: 16}}>
    <Row>
      <Item icon={<Icon.Export size={40} />} title={'Export'} />
      <Item icon={<Icon.Magnify size={40} />} title={'Magnify'} />
      <Item icon={<Icon.Received />} title={'Received'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Sent />} title={'Sent'} />
      <Item icon={<Icon.WalletAccount iconSeed={'asdasd'} />} title={'WalletAccount'} />
      <Item icon={<Icon.Emurgo width={40} height={40} />} title={'Emurgo'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Check height={40} width={40} />} title={'Check'} />
      <Item mode={'dark'} icon={<Icon.YoroiWallet height={40} width={40} />} title={'YoroiWallet'} />
      <Item icon={<Icon.Cardano height={40} width={40} />} title={'Cardano'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.Ada height={40} width={40} />} title={'AdaIcon'} />
      <Item icon={<Icon.RewardManuallyPayout height={40} width={40} />} title={'RewardManuallyPayout'} />
      <Item icon={<Icon.RewardWithdrawn height={40} width={40} />} title={'RewardWithdrawn'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.StakingKeyDeregistered height={40} width={40} />} title={'StakingKeyDeregistered'} />
      <Item icon={<Icon.StakingKeyRegistered height={40} width={40} />} title={'StakingKeyRegistered'} />
      <Item icon={<Icon.Transaction height={40} width={40} />} title={'Transaction'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.TotalAda height={40} width={40} />} title={'TotalAdaIcon'} />
      <Item icon={<Icon.TotalDelegated height={40} width={40} />} title={'TotalDelegated'} />
      <Item icon={<Icon.TotalReward height={40} width={40} />} title={'TotalReward'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.ChevronDown />} title={'ChevronDown'} />
      <Item icon={<Icon.ChevronUp />} title={'ChevronUp'} />
      <Item icon={<Icon.Verify />} title={'Verify'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.NoAssetImage />} title={'No Asset Image'} />
    </Row>
  </ScrollView>
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
