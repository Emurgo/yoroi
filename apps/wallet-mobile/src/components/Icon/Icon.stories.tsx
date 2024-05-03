import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ColorSchemeName, ScrollView, Text, TextInput, View} from 'react-native'

import {mockTransactionInfo} from '../../yoroi-wallets/mocks'
import {Icon} from '..'

storiesOf('Icon', module).add('Gallery', () => {
  return (
    <FilterProvider>
      <ScrollView contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap', padding: 16}}>
        <Item icon={<Icon.Bug size={40} />} title="Bug" />

        <Item icon={<Icon.Backspace size={40} />} title="Backspace" />

        <Item icon={<Icon.Export size={40} />} title="Export" />

        <Item icon={<Icon.Magnify size={40} />} title="Magnify" />

        <Item icon={<Icon.Received />} title="Received" />

        <Item icon={<Icon.WalletAccount iconSeed="" />} title="WalletAccount" />

        <Item icon={<Icon.Emurgo width={40} height={40} />} title="Emurgo" />

        <Item icon={<Icon.Check size={40} />} title="Check" />

        <Item mode="dark" icon={<Icon.YoroiWallet height={40} width={40} />} title="YoroiWallet" />

        <Item icon={<Icon.Cardano height={40} width={40} />} title="Cardano" />

        <Item icon={<Icon.Ada size={40} />} title="AdaIcon" />

        <Item icon={<Icon.RewardManuallyPayout height={40} width={40} />} title="RewardManuallyPayout" />

        <Item icon={<Icon.RewardWithdrawn height={40} width={40} />} title="RewardWithdrawn" />

        <Item icon={<Icon.StakingKeyDeregistered height={40} width={40} />} title="StakingKeyDeregistered" />

        <Item icon={<Icon.StakingKeyRegistered height={40} width={40} />} title="StakingKeyRegistered" />

        <Item icon={<Icon.Transaction size={40} />} title="Transaction" />

        <Item icon={<Icon.TotalAda height={40} width={40} />} title="TotalAdaIcon" />

        <Item icon={<Icon.TotalDelegated height={40} width={40} />} title="TotalDelegated" />

        <Item icon={<Icon.TotalReward height={40} width={40} />} title="TotalReward" />

        <Item icon={<Icon.Chevron direction="down" />} title="ChevronDown" />

        <Item icon={<Icon.Chevron direction="up" />} title="ChevronUp" />

        <Item icon={<Icon.Verify size={40} />} title="Verify" />

        <Item icon={<Icon.Catalyst size={40} />} title="Catalyst" />

        <Item icon={<Icon.Info size={40} />} title="Info" />

        <Item icon={<Icon.Menu size={40} />} title="Menu" />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'SENT', status: 'SUCCESSFUL'})} />}
          title="Success-Sent"
        />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'RECEIVED', status: 'SUCCESSFUL'})} />}
          title="Success-Received"
        />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'SELF', status: 'SUCCESSFUL'})} />}
          title="Success-Intrawallet"
        />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'SENT', status: 'PENDING'})} />}
          title="Pending-Sent"
        />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'RECEIVED', status: 'PENDING'})} />}
          title="Pending-Received"
        />

        <Item
          icon={<Icon.Direction transaction={mockTransactionInfo({direction: 'SELF', status: 'PENDING'})} />}
          title="Pending-Intrawallet"
        />

        <Item icon={<Icon.Settings size={40} />} title="Settings" />

        <Item icon={<Icon.TabWallet size={40} />} title="Tab Wallet" />

        <Item icon={<Icon.TabStaking size={40} />} title="Tab Stake" />

        <Item icon={<Icon.CrossCircle size={40} />} title="Cross Circle" />

        <Item icon={<Icon.Assets size={40} />} title="Assets" />

        <Item icon={<Icon.Bio size={40} />} title="Bio" />

        <Item icon={<Icon.Burger size={40} />} title="Burger" />

        <Item icon={<Icon.PlusCircle size={40} />} title="Plus Circle" />

        <Item icon={<Icon.CheckFilled size={40} />} title="Check Filled" />

        <Item icon={<Icon.CheckOutlined size={40} />} title="Check Outlined" />

        <Item icon={<Icon.Coins size={40} />} title="Coins" />

        <Item icon={<Icon.CopySuccess size={40} />} title="Copy Success" />

        <Item icon={<Icon.Copy size={40} />} title="Copy" />

        <Item icon={<Icon.Cross size={40} />} title="Cross" />

        <Item icon={<Icon.DappConnector size={40} />} title="Dapp Connector" />

        <Item icon={<Icon.Delete size={40} />} title="Delete" />

        <Item icon={<Icon.Device size={40} />} title="Device" />

        <Item icon={<Icon.DigitalAsset size={40} />} title="Digital Asset" />

        <Item icon={<Icon.Drag size={40} />} title="Drag" />

        <Item icon={<Icon.EyeOff size={40} />} title="Eye Off" />

        <Item icon={<Icon.EyeOn size={40} />} title="Eye On" />

        <Item icon={<Icon.Image size={40} />} title="Image" />

        <Item icon={<Icon.Globe size={40} />} title="Globe" />

        <Item icon={<Icon.Clock size={40} />} title="Clock" />

        <Item icon={<Icon.Lightning size={40} />} title="Lightning" />

        <Item icon={<Icon.Link size={40} />} title="Link" />

        <Item icon={<Icon.Lock size={40} />} title="Lock" />

        <Item icon={<Icon.Categories size={40} />} title="Categories" />

        <Item icon={<Icon.Launchpad size={40} />} title="Launchpad" />

        <Item icon={<Icon.Message size={40} />} title="Message" />

        <Item icon={<Icon.Plus size={40} />} title="Plus" />

        <Item icon={<Icon.PlateNumber size={40} />} title="Plate Number" />

        <Item icon={<Icon.Placeholder size={40} />} title="Placeholder" />

        <Item icon={<Icon.Pin size={40} />} title="Pin" />

        <Item icon={<Icon.NftAsset size={40} />} title="Nft Asset" />

        <Item icon={<Icon.Wallets size={40} />} title="Wallets" />

        <Item icon={<Icon.Qr size={40} />} title="Qr" />

        <Item icon={<Icon.QuestionMark size={40} />} title="Question Mark" />

        <Item icon={<Icon.Gear size={40} />} title="Gear" />

        <Item icon={<Icon.Megaphone size={40} />} title="Megaphone" />

        <Item icon={<Icon.ThumbsUp size={40} />} title="Thumbs Up" />

        <Item icon={<Icon.Sandbox size={40} />} title="Sandbox" />

        <Item icon={<Icon.SliderSettings size={40} />} title="Slider Settings" />

        <Item icon={<Icon.Facebook size={40} />} title="Facebook" />

        <Item icon={<Icon.Telegram size={40} />} title="Telegram" />

        <Item icon={<Icon.Github size={40} />} title="Github" />

        <Item icon={<Icon.Twitter size={40} />} title="Twitter" />

        <Item icon={<Icon.SortTable size={40} />} title="Sort Table" />

        <Item icon={<Icon.HardwareWallet size={40} />} title="Hardware Wallet" />

        <Item icon={<Icon.YoroiNightly size={40} />} title="Yoroi Nightly" />

        <Item icon={<Icon.Staking size={40} />} title="Staking" />

        <Item icon={<Icon.StarFilled size={40} />} title="Star Filled" />

        <Item icon={<Icon.StarOutlined size={40} />} title="Star Outlined" />

        <Item icon={<Icon.Support size={40} />} title="Support" />

        <Item icon={<Icon.Table size={40} />} title="Table" />

        <Item icon={<Icon.Theme size={40} />} title="Theme" />

        <Item icon={<Icon.TermsOfUse size={40} />} title="Terms Of Use" />

        <Item icon={<Icon.Tokens size={40} />} title="Tokens" />

        <Item icon={<Icon.WalletStack size={40} />} title="Wallet Stack" />

        <Item icon={<Icon.Wallet size={40} />} title="Wallet" />

        <Item icon={<Icon.NoNfts size={40} />} title="No NFTs" />

        <Item icon={<Icon.ExternalLink size={40} />} title="External link" />

        <Item icon={<Icon.Analytics size={40} />} title="Analytics" />

        <Item icon={<Icon.Swap />} title="Swap" />

        <Item icon={<Icon.Portfolio />} title="Portfolio" />

        <Item icon={<Icon.MinSwap />} title="MinSwap" />

        <Item icon={<Icon.SundaeSwap />} title="SundaeSwap" />

        <Item icon={<Icon.MuesliSwap />} title="MuesliSwap" />

        <Item icon={<Icon.SpectrumSwap />} title="SpectrumSwap" />

        <Item icon={<Icon.VyfiSwap />} title="VyfiSwap" />

        <Item icon={<Icon.WingRiders />} title="WingRiders" />

        <Item icon={<Icon.Logout />} title="Logout" />

        <Item icon={<Icon.Resync />} title="Resync" />

        <Item icon={<Icon.Danger />} title="Danger" />

        <Item icon={<Icon.Share />} title="Share" />

        <Item icon={<Icon.Governance />} title="Governance" />

        <Item icon={<Icon.ArrowRight size={40} />} title="ArrowRight" />

        <Item icon={<Icon.Exchange />} title="Exchange" />

        <Item icon={<Icon.Close />} title="Close" />

        <Item icon={<Icon.Warning />} title="Warning" />

        <Item icon={<Icon.Collateral />} title="Collateral" />

        <Item icon={<Icon.Discover />} title="Discover" />

        <Item icon={<Icon.CheckFilled2 />} title="CheckFilled2" />

        <Item icon={<Icon.DApp />} title="DApp Icon" />

        <Item icon={<Icon.Disconnect />} title="Disconnect" />

        <Item icon={<Icon.LockFilled />} title="LockFilled" />

        <Item icon={<Icon.Backward />} title="Backward" />

        <Item icon={<Icon.Forward />} title="Forward" />

        <Item icon={<Icon.Share2 />} title="Share2" />

        <Item icon={<Icon.Reload />} title="Reload" />

        <Item icon={<Icon.Square />} title="Square" />

        <Item icon={<Icon.Google />} title="Google" />
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
const FilterProvider = ({children}: {children: React.ReactNode}) => {
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
