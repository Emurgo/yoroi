import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, Text, View} from 'react-native'

import AdaIcon from '../../../legacy/assets/AdaIcon'
import CardanoIcon from '../../../legacy/assets/CardanoIcon'
import CheckIcon from '../../../legacy/assets/CheckIcon'
import EmurgoIcon from '../../../legacy/assets/EmurgoIcon'
import RewardManuallyPayoutIcon from '../../../legacy/assets/RewardManuallyPayoutIcon'
import RewardWithdrawnIcon from '../../../legacy/assets/RewardWithdrawnIcon'
import StakingKeyDeregisteredIcon from '../../../legacy/assets/StakingKeyDeregisteredIcon'
import StakingKeyRegisteredIcon from '../../../legacy/assets/StakingKeyRegisteredIcon'
import TransactionIcon from '../../../legacy/assets/TransactionIcon'
import YoroiWalletIcon from '../../../legacy/assets/YoroiWalletIcon'
import {Spacer} from '..'
import * as Icon from './Icon'
import {ReceivedIcon} from './ReceivedIcon'
import {SentIcon} from './SentIcon'
import {WalletAccountIcon} from './WalletAccountIcon'

storiesOf('Icon', module).add('Gallery', () => (
  <View style={{padding: 16}}>
    <Row>
      <Item icon={<Icon.Export size={40} />} title={'Export'} />
      <Item icon={<Icon.Magnify size={40} />} title={'Magnify'} />
      <Item icon={<ReceivedIcon />} title={'Received'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<SentIcon />} title={'Sent'} />
      <Item icon={<WalletAccountIcon iconSeed={'asdasd'} />} title={'WalletAccount'} />
      <Item icon={<EmurgoIcon width={60} height={60} />} title={'EmurgoIcon'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<CheckIcon height={60} width={60} />} title={'Check'} />
      <Item mode={'dark'} icon={<YoroiWalletIcon height={60} width={60} />} title={'YoroiWalletIcon'} />
      <Item icon={<CardanoIcon height={60} width={60} />} title={'CardanoIcon'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<AdaIcon height={60} width={60} />} title={'AdaIcon'} />
      <Item icon={<RewardManuallyPayoutIcon height={60} width={60} />} title={'RewardManuallyPayoutIcon'} />
      <Item icon={<RewardWithdrawnIcon height={60} width={60} />} title={'RewardWithdrawnIcon'} />
    </Row>

    <Spacer height={16} />

    <Row>
      <Item icon={<StakingKeyDeregisteredIcon height={60} width={60} />} title={'StakingKeyDeregisteredIcon'} />
      <Item icon={<StakingKeyRegisteredIcon height={60} width={60} />} title={'StakingKeyRegisteredIcon'} />
      <Item icon={<TransactionIcon height={60} width={60} />} title={'TransactionIcon'} />
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
