import {defineMessage} from '@formatjs/intl'
import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {Linking, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Spacer, Text, useModal} from '../../components'
import {dappExplorerEnabled} from '../../kernel/config'
import globalMessages from '../../kernel/i18n/global-messages'
import {useMetrics} from '../../kernel/metrics/metricsManager'
import {defaultStackNavigationOptions, useWalletNavigation} from '../../kernel/navigation'
import {usePrefetchStakingInfo} from '../../legacy/Dashboard/StakePoolInfos'
import {usePoolTransition} from '../../legacy/Staking/PoolTransition/usePoolTransition'
import {useCanVote} from '../RegisterCatalyst/common/hooks'
import {InsufficientFundsModal} from '../RegisterCatalyst/common/InsufficientFundsModal'
import {useIsGovernanceFeatureEnabled} from '../Staking/Governance'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'

const MenuStack = createStackNavigator()

export const MenuNavigator = () => {
  const strings = useStrings()
  const {atoms, color} = useTheme()

  return (
    <MenuStack.Navigator
      initialRouteName="_menu"
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
        headerLeft: () => null,
      }}
    >
      <MenuStack.Screen name="_menu" component={Menu} options={{title: strings.menu}} />
    </MenuStack.Navigator>
  )
}

export const Menu = () => {
  const strings = useStrings()
  const {styles, color} = useStyles()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {isPoolRetiring} = usePoolTransition()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.menuPageViewed()
    }, [track]),
  )
  const isGovernanceFeatureEnabled = useIsGovernanceFeatureEnabled(wallet)

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} bounces={false}>
        <AppSettings //
          label={strings.settings}
          onPress={navigateTo.settings}
          left={<Icon.Gear size={24} color={color.gray_c600} />}
        />

        {dappExplorerEnabled && (
          <Staking
            label={strings.stakingCenter}
            onPress={navigateTo.stakingCenter}
            left={<Icon.TabStaking size={24} color={color.gray_c600} />}
            right={isPoolRetiring ? <Icon.Warning size={24} color={color.sys_magenta_c500} /> : null}
          />
        )}

        {isGovernanceFeatureEnabled && (
          <Governance
            label={strings.governanceCentre}
            onPress={navigateTo.governanceCentre}
            left={<Icon.Governance size={24} color={color.gray_c600} />}
          />
        )}

        <Boundary loading={{size: 'small', style: {padding: 16}}} error={{size: 'inline'}}>
          <Catalyst //
            label={strings.catalystVoting}
            onPress={navigateTo.catalystVoting}
            left={<Icon.Catalyst size={24} color={color.gray_c600} />}
          />
        </Boundary>

        <KnowledgeBase //
          label={strings.knowledgeBase}
          onPress={navigateTo.knowledgeBase}
          left={<Icon.Info size={24} color={color.gray_c600} />}
        />

        <Spacer fill />

        <SupportLink />
      </ScrollView>
    </SafeAreaView>
  )
}

const SupportLink = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <View style={styles.support}>
      <View style={styles.supportTitle}>
        <Text style={styles.supportTitleText}>{strings.supportTitle}</Text>
      </View>

      <Spacer height={10} />

      <TouchableOpacity onPress={navigateTo.support} style={styles.supportLink}>
        <Icon.Support size={24} color="#4B6DDE" />

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
  right,
  disabled = false,
  onPress,
}: {
  label: string
  left: React.ReactElement
  disabled?: boolean
  right?: React.ReactElement | null
  onPress: () => void
}) => {
  const {styles, color} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={styles.item} disabled={disabled}>
      {left}

      <Spacer width={12} />

      <Text style={{fontFamily: 'Rubik-Medium', fontSize: 16, lineHeight: 24, color: color.gray_c900}}>{label}</Text>

      <Spacer fill />

      {right}

      <Spacer width={8} />

      <Icon.Chevron direction="right" size={28} color={color.gray_c600} />
    </TouchableOpacity>
  )
}

const Staking = Item
const Governance = Item
const AppSettings = Item
const KnowledgeBase = Item
const Catalyst = ({label, left, onPress}: {label: string; left: React.ReactElement; onPress: () => void}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {canVote, sufficientFunds} = useCanVote(wallet)
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 256)

  const handlePress = () => {
    if (sufficientFunds) {
      onPress()
    } else {
      openModal(strings.attention, <InsufficientFundsModal />, modalHeight)
    }
  }
  return <Item label={label} onPress={handlePress} left={left} disabled={!canVote} />
}

const SUPPORT_TICKET_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'
const KNOWLEDGE_BASE_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi'

const useNavigateTo = () => {
  const {navigation, navigateToSettings, navigateToGovernanceCentre, navigateToStakingDashboard} = useWalletNavigation()
  const {wallet} = useSelectedWallet()
  const prefetchStakingInfo = usePrefetchStakingInfo(wallet)

  return {
    catalystVoting: () => {
      prefetchStakingInfo()

      navigation.navigate('manage-wallets', {
        screen: 'voting-registration',
        params: {
          screen: 'download-catalyst',
        },
      })
    },
    stakingCenter: () => navigateToStakingDashboard(),
    settings: () => navigateToSettings(),
    support: () => Linking.openURL(SUPPORT_TICKET_LINK),
    knowledgeBase: () => Linking.openURL(KNOWLEDGE_BASE_LINK),
    governanceCentre: () => navigateToGovernanceCentre(),
  }
}

const useStrings = () => {
  const intl = useIntl()

  return {
    attention: intl.formatMessage(globalMessages.attention),
    catalystVoting: intl.formatMessage(messages.catalystVoting),
    settings: intl.formatMessage(messages.settings),
    stakingCenter: intl.formatMessage(messages.stakingCenter),
    supportTitle: intl.formatMessage(messages.supportTitle),
    supportLink: intl.formatMessage(messages.supportLink),
    knowledgeBase: intl.formatMessage(messages.knowledgeBase),
    menu: intl.formatMessage(messages.menu),
    releases: intl.formatMessage(messages.releases),
    governanceCentre: intl.formatMessage(messages.governanceCentre),
  }
}

const messages = defineMessage({
  staking: {
    id: 'menu.staking',
    defaultMessage: '!!!Staking center',
  },
  catalystVoting: {
    id: 'menu.catalystVoting',
    defaultMessage: '!!!Catalyst voting',
  },
  stakingCenter: {
    id: 'menu.stakingCenter',
    defaultMessage: '!!!Staking',
  },
  settings: {
    id: 'menu.settings',
    defaultMessage: '!!!Settings',
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
  releases: {
    id: 'menu.releases',
    defaultMessage: '!!!Releases',
  },
  governanceCentre: {
    id: 'menu.governanceCentre',
    defaultMessage: '!!!Governance centre',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    item: {
      ...atoms.py_lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: color.gray_c200,
    },
    scrollViewContent: {
      flex: 1,
      ...atoms.p_lg,
    },
    support: {
      alignItems: 'center',
    },
    supportTitle: {
      justifyContent: 'center',
    },
    supportTitleText: {
      color: color.gray_c600,
    },
    supportLink: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
    },
    supportLinkText: {
      color: color.primary_c500,
    },
  })

  return {styles, color}
}
