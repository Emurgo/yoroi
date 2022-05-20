import {defineMessage} from '@formatjs/intl'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'
import {Image, Linking, ScrollView, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {Text} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {tokenBalanceSelector} from '../../legacy/selectors'
import FaqImage from '../assets/img/icon/shape.png'
import {CatalystNavigator} from '../Catalyst/CatalystNavigator'
import {Icon, Spacer} from '../components'
import {useWalletMetas} from '../hooks'
import {defaultStackNavigationOptions, MenuRoutes, useWalletNavigation} from '../navigation'
import {InsufficientFundsModal} from './InsufficientFundsModal'

const FAQ_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi'

const MenuStack = createStackNavigator<MenuRoutes>()
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
      <ScrollView contentContainerStyle={{padding: 16, flex: 1}} bounces={false}>
        <View style={{flex: 1}}>
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
        </View>

        <View style={{alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
          <View style={{height: 16, justifyContent: 'center'}}>
            <Text style={{color: '#6B7384'}}>{strings.faqTitle}</Text>
          </View>

          <View
            style={{
              height: 50,
              width: 195,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Image source={FaqImage} style={{width: 20, height: 20}} />
            <Text bold style={{color: '#4B6DDE'}} onPress={navigateTo.faq}>
              {strings.faqLink}
            </Text>
          </View>
        </View>
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
    faq: () => Linking.openURL(FAQ_LINK),
  }
}

const useStrings = () => {
  const intl = useIntl()

  return {
    allWallets: intl.formatMessage(messages.allWallets),
    catalystVoting: intl.formatMessage(messages.catalystVoting),
    settings: intl.formatMessage(messages.settings),
    faqTitle: intl.formatMessage(messages.faqTitle),
    faqLink: intl.formatMessage(messages.faqLink),
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
  faqTitle: {
    id: 'menu.faqTitle',
    defaultMessage: '!!!Any Questions',
  },
  faqLink: {
    id: 'menu.faqLink',
    defaultMessage: '!!!ASK OUR SUPPORT TEAM',
  },
  menu: {
    id: 'menu',
    defaultMessage: '!!!Menu',
  },
})
