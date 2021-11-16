import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, Image, ScrollView, Text, View} from 'react-native'

import noImage from '../../../legacy/assets/img/asset_no_image.png'
import chevronDown from '../../../legacy/assets/img/chevron_down.png'
import chevronUp from '../../../legacy/assets/img/chevron_up.png'
import copy from '../../../legacy/assets/img/icon/copy.png'
import verify from '../../../legacy/assets/img/icon/verify-address.png'
import TotalAda from '../../../legacy/assets/staking/TotalAdaIcon'
import TotalDelegated from '../../../legacy/assets/staking/TotalDelegatedIcon'
import TotalReward from '../../../legacy/assets/staking/TotalRewardIcon'
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
      <Item icon={<Icon.RewardWithdrawn height={40} width={40} />} title={'RewardWithdrawnIcon'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Icon.StakingKeyDeregistered height={40} width={40} />} title={'StakingKeyDeregistered'} />
      <Item icon={<Icon.StakingKeyRegistered height={40} width={40} />} title={'StakingKeyRegistered'} />
      <Item icon={<Icon.Transaction height={40} width={40} />} title={'Transaction'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<TotalAda height={40} width={40} />} title={'TotalAdaIcon'} />
      <Item icon={<TotalDelegated height={40} width={40} />} title={'TotalDelegated'} />
      <Item icon={<TotalReward height={40} width={40} />} title={'TotalReward'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Image style={{height: 40, width: 40}} source={chevronDown} />} title={'ChevronDown'} />
      <Item icon={<Image style={{height: 40, width: 40}} source={chevronUp} />} title={'ChevronUp'} />
      <Item icon={<Image style={{height: 40, width: 40}} source={verify} />} title={'Verify'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<Image style={{height: 40, width: 40}} source={noImage} />} title={'No Image'} />
      <Item icon={<Image style={{height: 40, width: 40}} source={copy} />} title={'Copy'} />
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
