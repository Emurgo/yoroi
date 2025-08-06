import {defineMessage} from '@formatjs/intl'
import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {MenuRoutes} from '~/kernel/navigation/types'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {usePrefetchStakingInfo} from '../Dashboard/StakePoolInfos'
import {useCanVote} from '../RegisterCatalyst/common/hooks'
import {InsufficientFundsModal} from '../RegisterCatalyst/common/InsufficientFundsModal'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {usePoolTransition} from '../Staking/Staking/PoolTransition/usePoolTransition'

const MenuStack = createStackNavigator<MenuRoutes>()

export const MenuNavigator = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <MenuStack.Navigator
      initialRouteName="_menu"
      screenOptions={{
        ...defaultStackNavigationOptions(ta, p),
        headerLeft: () => null,
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <MenuStack.Screen
        name="_menu"
        component={Menu}
        options={{title: strings.menu.menu}}
      />
    </MenuStack.Navigator>
  )
}

export const Menu = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {isPoolRetiring} = usePoolTransition()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.menuPageViewed()
    }, [track]),
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.flex_1, a.p_lg]} bounces={false}>
        <AppSettings //
          label={strings.menu.settings}
          onPress={navigateTo.settings}
          left={<Icon.Gear size={24} color={p.gray_600} />}
        />

        <Staking
          label={strings.menu.stakingCenter}
          onPress={navigateTo.stakingCenter}
          left={<Icon.TabStaking size={24} color={p.gray_600} />}
          right={
            isPoolRetiring ? (
              <Icon.Warning size={24} color={p.sys_magenta_500} />
            ) : null
          }
        />

        <Governance
          label={strings.menu.governanceCentre}
          onPress={navigateTo.governanceCentre}
          left={<Icon.TabGovernance size={24} color={p.gray_600} />}
        />

        <Catalyst
          label={strings.menu.catalystVoting}
          onPress={navigateTo.catalystVoting}
          left={<Icon.TabCatalyst size={24} color={p.gray_600} />}
        />

        <SupportLink />

        <Space.Height.lg />

        <Button
          onPress={navigateTo.knowledgeBase}
          title={strings.menu.knowledgeBase}
          type="Secondary"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const SupportLink = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()

  return (
    <View style={a.align_center}>
      <View style={a.justify_center}>
        <Text style={{color: p.gray_600}}>{strings.supportTitle}</Text>
      </View>

      <Space.Height.lg />

      <TouchableOpacity
        onPress={navigateTo.support}
        style={[a.justify_between, a.align_center, a.flex_row]}
      >
        <Icon.Support size={24} color="#4B6DDE" />

        <Space.Width.lg />

        <Text style={[ta.el_primary_medium, a.body_2_md_medium]}>
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
  const {atoms: ta, palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        a.py_lg,
        a.flex_row,
        a.align_center,
        a.justify_center,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: p.gray_200,
        },
      ]}
      disabled={disabled}
    >
      {left}

      <Space.Width.lg />

      <Text style={[a.body_2_md_regular, ta.el_gray_max]}>{label}</Text>

      <Space.Height.sm fill />

      {right}

      <Space.Width.sm />

      <Icon.Chevron direction="right" size={28} color={p.gray_600} />
    </TouchableOpacity>
  )
}

const Staking = Item
const Governance = Item
const AppSettings = Item
const KnowledgeBase = Item
const Catalyst = ({
  label,
  left,
  onPress,
}: {
  label: string
  left: React.ReactElement
  onPress: () => void
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {sufficientFunds} = useCanVote(wallet)
  const {openModal, closeModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 280)

  const handlePress = () => {
    if (sufficientFunds) {
      onPress()
    } else {
      openModal({
        title: strings.attention,
        content: <InsufficientFundsModal />,
        footer: <Button title={strings.back} onPress={closeModal} />,
        height: modalHeight,
      })
    }
  }
  return <Item label={label} onPress={handlePress} left={left} />
}

const SUPPORT_TICKET_LINK =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'
const KNOWLEDGE_BASE_LINK =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi'

const useNavigateTo = () => {
  const {
    navigation,
    navigateToSettings,
    navigateToGovernanceCentre,
    navigateToStakingDashboard,
  } = useWalletNavigation()
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
