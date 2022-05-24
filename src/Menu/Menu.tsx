import {defineMessage} from '@formatjs/intl'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} bounces={false}>
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

        <Spacer fill />

        <FAQ />
      </ScrollView>
    </SafeAreaView>
  )
}

const FAQ = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <View style={styles.faqContainer}>
      <View style={styles.faqTitle}>
        <Text style={styles.faqTitleText}>{strings.faqTitle}</Text>
      </View>

      <TouchableOpacity onPress={navigateTo.faq} style={styles.faqLink}>
        <Image source={FaqImage} style={styles.faqLinkImage} />
        <Text bold style={styles.faqLinkText}>
          {strings.faqLink}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const Item = ({label, left, onPress}: {label: string; left: React.ReactElement; onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.itemTouchableOpacity}>
      {left}
      <Spacer width={12} />
      <Text style={styles.itemText}>{label}</Text>
      <Spacer fill />
      <Icon.Chevron direction="right" size={16} color="#6B7384" />
    </TouchableOpacity>
  )
}

const HR = () => {
  return <View style={styles.hr} />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hr: {
    height: 1,
    backgroundColor: 'lightgrey',
  },
  itemTouchableOpacity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemText: {
    color: '#242838',
  },
  scrollViewContent: {
    flex: 1,
    padding: 16,
  },
  faqContainer: {
    alignItems: 'center',
  },
  faqTitle: {
    height: 16,
    justifyContent: 'center',
  },
  faqTitleText: {
    color: '#6B7384',
  },
  faqLink: {
    height: 50,
    width: 195,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  faqLinkImage: {
    width: 20,
    height: 20,
  },
  faqLinkText: {
    color: '#4B6DDE',
  },
})
