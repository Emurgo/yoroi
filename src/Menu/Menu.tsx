import {defineMessage} from '@formatjs/intl'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import SupportImage from '../assets/img/icon/shape.png'
import {CatalystNavigator} from '../Catalyst/CatalystNavigator'
import {Icon, Spacer} from '../components'
import {useWalletMetas} from '../hooks'
import {CONFIG} from '../legacy/config'
import {tokenBalanceSelector} from '../legacy/selectors'
import {Text} from '../legacy/Text'
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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} bounces={false}>
        <AppSettings //
          label={strings.settings}
          onPress={navigateTo.appSettings}
          left={<Icon.Gear size={26} color="#6B7384" />}
        />

        <HR />

        <AllWallets
          label={`${strings.allWallets} (${walletCount})`}
          onPress={navigateTo.allWallets}
          left={<Icon.Wallets size={26} color="#6B7384" />}
        />

        <HR />

        <Catalyst //
          label={strings.catalystVoting}
          onPress={navigateTo.catalystVoting}
          left={<Icon.Catalyst size={26} color="#6B7384" />}
        />

        <HR />

        <KnowledgeBase //
          label={strings.knowledgeBase}
          onPress={navigateTo.knowledgeBase}
          left={<Icon.Info size={24} color="#6B7384" />}
        />

        <HR />

        <Spacer fill />

        <SupportLink />
      </ScrollView>
    </SafeAreaView>
  )
}

const SupportLink = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <View style={styles.support}>
      <View style={styles.supportTitle}>
        <Text style={styles.supportTitleText}>{strings.supportTitle}</Text>
      </View>
      <Spacer height={10} />
      <TouchableOpacity onPress={navigateTo.support} style={styles.supportLink}>
        <Image source={SupportImage} />
        <Spacer width={10} />
        <Text bold style={styles.supportLinkText}>
          {strings.supportLink.toLocaleUpperCase()}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const Item = ({label, left, onPress}: {label: string; left: React.ReactElement; onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
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
const AppSettings = Item
const KnowledgeBase = Item
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

const SUPPORT_TICKET_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'
const KNOWLEDGE_BASE_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi'

const useNavigateTo = () => {
  const {navigation, navigateToAppSettings} = useWalletNavigation()

  return {
    allWallets: () => navigation.navigate('app-root', {screen: 'wallet-selection'}),
    catalystVoting: () =>
      navigation.navigate('app-root', {
        screen: 'catalyst-router',
        params: {
          screen: 'catalyst-landing',
        },
      }),
    appSettings: () => navigateToAppSettings(),
    support: () => Linking.openURL(SUPPORT_TICKET_LINK),
    knowledgeBase: () => Linking.openURL(KNOWLEDGE_BASE_LINK),
  }
}

const useStrings = () => {
  const intl = useIntl()

  return {
    allWallets: intl.formatMessage(messages.allWallets),
    catalystVoting: intl.formatMessage(messages.catalystVoting),
    settings: intl.formatMessage(messages.settings),
    supportTitle: intl.formatMessage(messages.supportTitle),
    supportLink: intl.formatMessage(messages.supportLink),
    knowledgeBase: intl.formatMessage(messages.knowledgeBase),
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
    defaultMessage: '!!!App Settings',
  },
  supportTitle: {
    id: 'menu.supportTitle',
    defaultMessage: '!!!Any questions',
  },
  supportLink: {
    id: 'menu.supportLink',
    defaultMessage: '!!!Ask our support team',
  },
  knowledgeBase: {
    id: 'menu.knowledgeBase',
    defaultMessage: '!!!Knowledge base',
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
  item: {
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
  support: {
    alignItems: 'center',
  },
  supportTitle: {
    justifyContent: 'center',
  },
  supportTitleText: {
    color: '#6B7384',
  },
  supportLink: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  supportLinkText: {
    color: '#4B6DDE',
  },
})
