import {defineMessage} from '@formatjs/intl'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import SupportImage from '../assets/img/icon/shape.png'
import {CatalystNavigator} from '../Catalyst/CatalystNavigator'
import {Hr, Icon, Spacer, Text} from '../components'
import {CONFIG} from '../legacy/config'
import {tokenBalanceSelector} from '../legacy/selectors'
import {defaultStackNavigationOptionsV2, useWalletNavigation} from '../navigation'
import {lightPalette} from '../theme'
import {InsufficientFundsModal} from './InsufficientFundsModal'

const MenuStack = createStackNavigator()

export const MenuNavigator = () => {
  const strings = useStrings()

  return (
    <MenuStack.Navigator
      initialRouteName="menu"
      screenOptions={{...defaultStackNavigationOptionsV2, headerLeft: () => null}}
    >
      <MenuStack.Screen name="menu" component={Menu} options={{title: strings.menu}} />
      <MenuStack.Screen name="catalyst-voting" component={CatalystNavigator} />
    </MenuStack.Navigator>
  )
}

export const Menu = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} bounces={false}>
        <AppSettings //
          label={strings.appSettings}
          onPress={navigateTo.appSettings}
          left={<Icon.Gear size={24} color={lightPalette.gray['600']} />}
        />

        <Hr />

        <Catalyst //
          label={strings.catalystVoting}
          onPress={navigateTo.catalystVoting}
          left={<Icon.Catalyst size={24} color={lightPalette.gray['600']} />}
        />

        <Hr />

        <KnowledgeBase //
          label={strings.knowledgeBase}
          onPress={navigateTo.knowledgeBase}
          left={<Icon.Info size={24} color={lightPalette.gray['600']} />}
        />

        <Hr />

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

const Item = ({
  label,
  left,
  right = null,
  onPress,
}: {
  label: string
  left: React.ReactElement
  right?: React.ReactElement | null
  onPress: () => void
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      {left}
      <Spacer width={12} />
      <Text style={{fontFamily: 'Rubik-Medium', fontSize: 16, lineHeight: 24, color: lightPalette.gray['900']}}>
        {label}
      </Text>
      <Spacer fill />
      {right}
      <Spacer width={8} />
      <Icon.Chevron direction="right" size={28} color={lightPalette.gray['600']} />
    </TouchableOpacity>
  )
}

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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

const useStrings = () => {
  const intl = useIntl()

  return {
    catalystVoting: intl.formatMessage(messages.catalystVoting),
    appSettings: intl.formatMessage(messages.appSettings),
    releases: intl.formatMessage(messages.releases),
    supportTitle: intl.formatMessage(messages.supportTitle),
    supportLink: intl.formatMessage(messages.supportLink),
    knowledgeBase: intl.formatMessage(messages.knowledgeBase),
    menu: intl.formatMessage(messages.menu),
  }
}

const messages = defineMessage({
  catalystVoting: {
    id: 'menu.catalystVoting',
    defaultMessage: '!!!Catalyst voting',
  },
  appSettings: {
    id: 'menu.appSettings',
    defaultMessage: '!!!App Settings',
  },
  releases: {
    id: 'menu.releases',
    defaultMessage: '!!!Releases',
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
