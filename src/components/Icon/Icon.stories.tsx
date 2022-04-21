import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, ScrollView, Text, TextInput, View} from 'react-native'

import {mockTransaction} from '../../../storybook/mocks'
import {Icon} from '..'

storiesOf('Icon', module).add('Gallery', () => {
  return (
    <FilterProvider>
      <ScrollView contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap', padding: 16}}>
        <Item icon={<Icon.Export size={40} />} title="Export" />
        <Item icon={<Icon.Magnify size={40} />} title="Magnify" />
        <Item icon={<Icon.Received />} title="Received" />
        <Item icon={<Icon.Sent />} title="Sent" />
        <Item icon={<Icon.WalletAccount iconSeed="asdasd" />} title="WalletAccount" />
        <Item icon={<Icon.Emurgo width={40} height={40} />} title="Emurgo" />
        <Item icon={<Icon.Check height={40} width={40} />} title="Check" />
        <Item mode="dark" icon={<Icon.YoroiWallet height={40} width={40} />} title="YoroiWallet" />
        <Item icon={<Icon.Cardano height={40} width={40} />} title="Cardano" />
        <Item icon={<Icon.Ada height={40} width={40} />} title="AdaIcon" />
        <Item icon={<Icon.RewardManuallyPayout height={40} width={40} />} title="RewardManuallyPayout" />
        <Item icon={<Icon.RewardWithdrawn height={40} width={40} />} title="RewardWithdrawn" />
        <Item icon={<Icon.StakingKeyDeregistered height={40} width={40} />} title="StakingKeyDeregistered" />
        <Item icon={<Icon.StakingKeyRegistered height={40} width={40} />} title="StakingKeyRegistered" />
        <Item icon={<Icon.Transaction height={40} width={40} />} title="Transaction" />
        <Item icon={<Icon.TotalAda height={40} width={40} />} title="TotalAdaIcon" />
        <Item icon={<Icon.TotalDelegated height={40} width={40} />} title="TotalDelegated" />
        <Item icon={<Icon.TotalReward height={40} width={40} />} title="TotalReward" />
        <Item icon={<Icon.Chevron direction="down" />} title="ChevronDown" />
        <Item icon={<Icon.Chevron direction="up" />} title="ChevronUp" />
        <Item icon={<Icon.Verify />} title="Verify" />
        <Item icon={<Icon.Catalyst />} title="Catalyst" />
        <Item icon={<Icon.Info size={40} />} title="Info" />
        <Item icon={<Icon.Menu size={40} />} title="Menu" />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'SENT', status: 'SUCCESSFUL'})} />}
          title="Success-Sent"
        />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'RECEIVED', status: 'SUCCESSFUL'})} />}
          title="Success-Received"
        />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'SELF', status: 'SUCCESSFUL'})} />}
          title="Success-Intrawallet"
        />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'SENT', status: 'PENDING'})} />}
          title="Pending-Sent"
        />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'RECEIVED', status: 'PENDING'})} />}
          title="Pending-Received"
        />
        <Item
          icon={<Icon.Direction transaction={mockTransaction({direction: 'SELF', status: 'PENDING'})} />}
          title="Pending-Intrawallet"
        />
        <Item icon={<Icon.NoAssetImage />} title="No Asset Image" />
        <Item icon={<Icon.Settings size={40} />} title="Settings" />
        <Item icon={<Icon.Info size={40} />} title="Settings" />
        <Item icon={<Icon.TabWallet size={40} />} title="Tab Wallet" />
        <Item icon={<Icon.TabStaking size={40} />} title="Tab Stake" />
      </ScrollView>
    </FilterProvider>
  )
})

const Item = ({title, icon, mode = 'light'}: {title: string; icon: React.ReactElement; mode?: ColorSchemeName}) => {
  const filter = useFilter()

  return title.includes(filter) ? (
    <View style={{borderWidth: 1, width: '25%', aspectRatio: 1}}>
      <View style={{alignItems: 'center', borderBottomWidth: 1}}>
        <Text numberOfLines={1} ellipsizeMode="tail">
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
  ) : null
}

const FilterContext = React.createContext('')
const FilterProvider: React.FC = ({children}) => {
  const [filter, setFilter] = React.useState('')

  return (
    <FilterContext.Provider value={filter}>
      <View style={{paddingVertical: 8, paddingHorizontal: 16, height: 60}}>
        <TextInput
          placeholder="Filter Icons"
          autoFocus
          style={{borderWidth: 1, flex: 1, paddingVertical: 4, paddingHorizontal: 8}}
          onChangeText={setFilter}
        />
      </View>
      {children}
    </FilterContext.Provider>
  )
}

const useFilter = () => React.useContext(FilterContext)
