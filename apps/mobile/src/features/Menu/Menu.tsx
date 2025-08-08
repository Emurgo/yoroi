import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  Linking,
  ScrollView,
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
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {MenuRoutes} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {useCanVote} from '../RegisterCatalyst/common/hooks'
import {InsufficientFundsModal} from '../RegisterCatalyst/common/InsufficientFundsModal'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {usePoolTransition} from '../Staking/Staking/PoolTransition/usePoolTransition'

const MenuStack = createStackNavigator<MenuRoutes>()

export const MenuNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <MenuStack.Navigator
      initialRouteName="_menu"
      screenOptions={{
        ...defaultStackNavigationOptions(p),
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
  const navigateTo = useWalletNavigation()
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
          onPress={navigateTo.navigateToSettings}
          left={<Icon.Gear size={24} color={p.gray_600} />}
        />

        <Staking
          label={strings.menu.stakingCenter}
          onPress={navigateTo.navigateToStakingDashboard}
          left={<Icon.TabStaking size={24} color={p.gray_600} />}
          right={
            isPoolRetiring ? (
              <Icon.Warning size={24} color={p.sys_magenta_500} />
            ) : null
          }
        />

        <Governance
          label={strings.menu.governanceCentre}
          onPress={navigateTo.navigateToGovernanceCentre}
          left={<Icon.Governance size={24} color={p.gray_600} />}
        />

        <React.Suspense
          fallback={
            <Item
              label={strings.menu.catalystVoting}
              left={<Icon.Catalyst size={24} color={p.gray_600} />}
              onPress={() => {}}
              disabled
            />
          }
        >
          <Catalyst
            label={strings.menu.catalystVoting}
            left={<Icon.Catalyst size={24} color={p.gray_600} />}
            onPress={navigateTo.navigateToGovernanceCentre}
          />
        </React.Suspense>

        <Space.Height.lg fill />

        <SupportLink />
      </ScrollView>
    </SafeAreaView>
  )
}

const AppSettings = ({
  label,
  left,
  onPress,
}: {
  label: string
  left: React.ReactElement
  onPress: () => void
}) => {
  return <Item label={label} left={left} onPress={onPress} />
}

const Staking = ({
  label,
  left,
  right,
  onPress,
}: {
  label: string
  left: React.ReactElement
  right?: React.ReactElement | null
  onPress: () => void
}) => {
  return <Item label={label} left={left} right={right} onPress={onPress} />
}

const Governance = ({
  label,
  left,
  onPress,
}: {
  label: string
  left: React.ReactElement
  onPress: () => void
}) => {
  return <Item label={label} left={left} onPress={onPress} />
}

const SupportLink = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const handleSupportPress = () => {
    Linking.openURL('https://yoroi-wallet.com/support')
  }

  const handleKnowledgeBasePress = () => {
    Linking.openURL('https://yoroi-wallet.com/help')
  }

  return (
    <View>
      <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
        {strings.menu.supportTitle}
      </Text>
      <Space.Height.sm />
      <Item
        label={strings.menu.supportLink}
        left={<Icon.Support size={24} color={p.gray_600} />}
        onPress={handleSupportPress}
      />
      <Item
        label={strings.menu.knowledgeBase}
        left={<Icon.Info size={24} color={p.gray_600} />}
        onPress={handleKnowledgeBasePress}
      />
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
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[
        a.flex_row,
        a.align_center,
        a.justify_between,
        a.py_lg,
        {opacity: disabled ? 0.5 : 1},
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[a.flex_row, a.align_center]}>
        {left}
        <Space.Width.sm />
        <Text
          style={[
            a.body_1_lg_medium,
            {color: disabled ? p.gray_500 : p.gray_900},
          ]}
        >
          {label}
        </Text>
      </View>
      {right && <View>{right}</View>}
    </TouchableOpacity>
  )
}

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
        title: strings.menu.attention,
        content: <InsufficientFundsModal />,
        footer: <Button title={strings.menu.back} onPress={closeModal} />,
        height: modalHeight,
      })
    }
  }

  return <Item label={label} left={left} onPress={handlePress} />
}
