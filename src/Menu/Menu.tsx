import {defineMessage} from '@formatjs/intl'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'
import {Linking, ScrollView, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {CatalystNavigator} from '../Catalyst/CatalystNavigator'
import {Icon, Spacer, Text} from '../components'
import {useWalletMetas} from '../hooks'
import {CONFIG} from '../legacy/config'
import {tokenBalanceSelector} from '../legacy/selectors'
import {defaultStackNavigationOptions, useWalletNavigation} from '../navigation'
import {InsufficientFundsModal} from './InsufficientFundsModal'

const MenuStack = createStackNavigator()

export const MenuNavigator = () => {
  const strings = useStrings()

  return (
    <MenuStack.Navigator
      initialRouteName="menu"
      screenOptions={{...defaultStackNavigationOptions, headerLeft: () => null}}
    >
      <MenuStack.Screen name="menu" component={Menu} options={{title: strings.menu}} />
      <MenuStack.Screen name="catalyst-voting" component={CatalystNavigator} />
    </MenuStack.Navigator>
  )
}

export const Menu = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const walletMetas = useWalletMetas()
  const walletCount = walletMetas?.length || ''

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1}}>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16}} bounces={false}>
        <AllWallets
          label={`${strings.allWallets} (${walletCount})`}
          onPress={navigateTo.allWallets}
          left={<Icon.Wallets size={24} color="#6B7384" />}
        />
        <HR />

        <Spacer height={24} />

        <Catalyst //
          label={strings.catalystVoting}
          onPress={navigateTo.catalystVoting}
          left={<Icon.Catalyst size={24} color="#6B7384" />}
        />

        <HR />

        <Settings //
          label={strings.settings}
          onPress={navigateTo.settings}
          left={<Icon.Gear size={24} color="#6B7384" />}
        />
        <HR />

        <FAQ //
          label={strings.faq}
          onPress={navigateTo.faq}
          left={<Icon.QuestionMark size={24} color="#6B7384" />}
        />
        <HR />
      </ScrollView>
    </SafeAreaView>
  )
}

const Item = ({label, left, onPress}: {label: string; left: React.ReactElement; onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 16}}>
      {left}
      <Spacer width={12} />
      <Text style={{color: '#242838'}}>{label}</Text>
      <Spacer fill />
      <Icon.Chevron direction="right" size={16} color="#6B7384" />
    </TouchableOpacity>
  )
}

const HR = () => {
  return <View style={{height: 1, backgroundColor: 'lightgrey'}} />
}

const AllWallets = Item
const Settings = Item
const FAQ = Item
const Catalyst = ({label, left, onPress}: {label: string; left: React.ReactElement; onPress: () => void}) => {
  const tokenBalance = useSelector(tokenBalanceSelector)
  const sufficientFunds = tokenBalance.getDefault().gte(CONFIG.CATALYST.MIN_ADA)

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = React.useState(false)

  return (
    <>
      <Item
        label={label}
        onPress={() => (sufficientFunds ? onPress() : setShowInsufficientFundsModal(true))}
        left={left}
      />

      <InsufficientFundsModal
        visible={showInsufficientFundsModal}
        onRequestClose={() => setShowInsufficientFundsModal(false)}
      />
    </>
  )
}

const useNavigateTo = () => {
  const {navigation, navigateToSettings} = useWalletNavigation()

  return {
    allWallets: () => navigation.navigate('app-root', {screen: 'wallet-selection'}),
    catalystVoting: () =>
      navigation.navigate('app-root', {
        screen: 'catalyst-router',
        params: {
          screen: 'catalyst-landing',
        },
      }),
    settings: () => navigateToSettings(),
    faq: () => Linking.openURL('https://yoroi-wallet.com/faq/'),
  }
}

const useStrings = () => {
  const intl = useIntl()

  return {
    allWallets: intl.formatMessage(messages.allWallets),
    catalystVoting: intl.formatMessage(messages.catalystVoting),
    settings: intl.formatMessage(messages.settings),
    faq: intl.formatMessage(messages.faq),
    menu: intl.formatMessage(messages.menu),
  }
}

const messages = defineMessage({
  allWallets: {
    id: 'menu.allWallets',
    defaultMessage: '!!!All wallets',
  },
  catalystVoting: {
    id: 'menu.catalystVoting',
    defaultMessage: '!!!Catalyst voting',
  },
  settings: {
    id: 'menu.settings',
    defaultMessage: '!!!Settings',
  },
  faq: {
    id: 'menu.faq',
    defaultMessage: '!!!FAQ',
  },
  menu: {
    id: 'menu',
    defaultMessage: '!!!Menu',
  },
})
