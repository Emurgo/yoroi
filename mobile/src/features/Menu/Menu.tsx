import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {createStackNavigator} from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {useHasRedeemableThaws} from '~/features/Airdrop/common/useHasRedeemableThaws'
import {AirdropNavigator} from '~/features/Airdrop/ui/AirdropNavigator'
import {usePrefetchStakingInfo} from '~/features/Dashboard/ui/shared/StakePoolInfos'
import {useCanVote} from '~/features/RegisterCatalyst/common/hooks'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useIsByronWallet} from '~/features/WalletManager/hooks/useIsByronWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {MenuRoutes} from '~/kernel/navigation/types'
import {Badge} from '~/ui/Badge/Badge'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

import {InsufficientFundsModal} from '../RegisterCatalyst/common/InsufficientFundsModal'
import {usePoolTransition} from '../Staking/Staking/PoolTransition/usePoolTransition'
import {MessageSigningResultScreen} from '../Transactions/useCases/MessageSigning/MessageSigningResultScreen'
import {MessageSigningScreen} from '../Transactions/useCases/MessageSigning/MessageSigningScreen'
import {UtxoConsolidation} from '../Transactions/useCases/UtxoConsolidation/UtxoConsolidation/UtxoConsolidation'
import {UtxoList as UtxoListScreen} from '../Transactions/useCases/UtxoList/UtxoList'

const MenuStack = createStackNavigator<MenuRoutes>()

export const MenuNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {config} = useRemoteConfig()
  const isAirdropEnabled = config?.features?.midnightAirdrop?.enabled ?? false

  return (
    <MenuStack.Navigator
      initialRouteName="_menu"
      screenOptions={{
        ...defaultStackNavigationOptions(p),
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <MenuStack.Screen
        name="_menu"
        component={Menu}
        options={{title: strings.menu.menu, headerLeft: () => null}}
      />

      {isAirdropEnabled && (
        <MenuStack.Screen
          name="airdrop"
          options={{
            headerShown: false,
          }}
          getComponent={() => AirdropNavigator}
        />
      )}

      <MenuStack.Screen
        name="utxo-list"
        options={{
          title: strings.transactions.utxo.utxoListTitle,
        }}
        getComponent={() => UtxoListScreen}
      />

      <MenuStack.Screen
        name="utxo-consolidation"
        options={{
          title: strings.transactions.utxo.utxoConsolidationTitle,
        }}
        getComponent={() => UtxoConsolidation}
      />

      <MenuStack.Screen
        name="message-signing"
        options={{
          title: strings.transactions.messageSigning.messageSigningTitle,
        }}
        getComponent={() => MessageSigningScreen}
      />

      <MenuStack.Screen
        name="message-signing-result"
        options={{
          title: strings.transactions.messageSigning.messageSigningResultTitle,
        }}
        getComponent={() => MessageSigningResultScreen}
      />
    </MenuStack.Navigator>
  )
}

export const Menu = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {isPoolRetiring} = usePoolTransition()
  const {config} = useRemoteConfig()
  const isAirdropEnabled = config?.features?.midnightAirdrop?.enabled ?? false
  const {hasRedeemableThaws} = useHasRedeemableThaws()
  const isByronWallet = useIsByronWallet()

  return (
    <SafeAreaView edges={['left', 'right']} style={[ta.bg_color_max, a.flex_1]}>
      <ScrollView contentContainerStyle={[a.flex_1, a.p_lg]} bounces={false}>
        <AppSettings //
          label={strings.menu.settings}
          onPress={navigateTo.settings}
          left={<Icon.Gear size={24} color={p.gray_600} />}
        />

        {!isByronWallet && (
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
        )}

        {!isByronWallet && (
          <Governance
            label={strings.menu.governanceCentre}
            onPress={navigateTo.governanceCentre}
            left={<Icon.Governance size={24} color={p.gray_600} />}
          />
        )}

        {!isByronWallet && (
          <Catalyst
            label={strings.menu.catalystVoting}
            onPress={navigateTo.catalystVoting}
            left={<Icon.Catalyst size={24} color={p.gray_600} />}
          />
        )}

        <UtxoList
          label={strings.menu.utxoList}
          onPress={navigateTo.utxoList}
          left={<Icon.Burger size={24} color={p.gray_600} />}
        />

        <MessageSigning
          label={strings.menu.messageSigning}
          onPress={navigateTo.messageSigning}
          left={<Icon.Message size={24} color={p.gray_600} />}
        />

        {isAirdropEnabled && !isByronWallet && (
          <Airdrop
            label={strings.menu.airdrop}
            onPress={navigateTo.airdrop}
            left={<Icon.Airdrop size={24} color={p.gray_600} />}
            right={
              hasRedeemableThaws ? (
                <Badge label={strings.airdrop.redeem} color={p.bg_gradient_4} />
              ) : null
            }
          />
        )}

        <KnowledgeBase //
          label={strings.menu.knowledgeBase}
          onPress={navigateTo.knowledgeBase}
          left={<Icon.Info size={24} color={p.gray_600} />}
        />
        <Space.Height.lg fill />
        <SupportLink />
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
        <Text style={{color: p.gray_600}}>{strings.menu.supportTitle}</Text>
      </View>

      <Space.Height.lg />

      <TouchableOpacity
        onPress={navigateTo.support}
        style={[a.justify_between, a.align_center, a.flex_row]}
      >
        <Icon.Support size={24} color={p.primary_600} />

        <Space.Width.lg />

        <Text style={[ta.el_primary_medium, a.body_2_md_medium]}>
          {strings.menu.supportLink.toLocaleUpperCase()}
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
        a.border_b,
        {
          borderBottomColor: p.gray_200,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      disabled={disabled}
    >
      {left}

      <Space.Width.lg />

      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>{label}</Text>
        {right}
      </View>

      <Space.Height.sm fill />

      <Space.Width.sm />

      <Icon.Chevron direction="right" size={28} color={p.gray_600} />
    </TouchableOpacity>
  )
}

const Staking = Item
const UtxoList = Item
const MessageSigning = Item
const Governance = Item
const AppSettings = Item
const KnowledgeBase = Item
const Airdrop = Item
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
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {sufficientFunds, isLoading} = useCanVote(wallet)
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 280)

  const handlePress = () => {
    if (sufficientFunds) {
      onPress()
    } else {
      openModal({
        title: strings.menu.attention,
        content: React.createElement(InsufficientFundsModal.Content),
        footer: React.createElement(InsufficientFundsModal.Footer),
        height: modalHeight,
        withFeedback: true,
      })
    }
  }

  if (isLoading) {
    return (
      <Item
        disabled
        onPress={() => null}
        label={label}
        left={left}
        right={<ActivityIndicator color={p.gray_600} />}
      />
    )
  }

  return <Item label={label} onPress={handlePress} left={left} />
}

const SUPPORT_TICKET_LINK = 'https://help.yoroi-wallet.com/en/'
const KNOWLEDGE_BASE_LINK = 'https://help.yoroi-wallet.com/en/'

const useNavigateTo = () => {
  const {
    navigateToSettings,
    navigateToGovernanceCentre,
    navigateToStakingDashboard,
    navigateToCatalystVotingDashboard,
    navigateToUtxoList,
    navigateToMessageSigning,
    navigateToAirdrop,
  } = useWalletNavigation()
  const {wallet} = useSelectedWallet()

  const prefetchStakingInfo = usePrefetchStakingInfo(wallet)

  return {
    catalystVoting: () => {
      prefetchStakingInfo()
      navigateToCatalystVotingDashboard()
    },
    stakingCenter: () => {
      navigateToStakingDashboard()
    },
    utxoList: () => navigateToUtxoList(),
    messageSigning: () => navigateToMessageSigning(),
    settings: () => navigateToSettings(),
    support: () => Linking.openURL(SUPPORT_TICKET_LINK),
    knowledgeBase: () => Linking.openURL(KNOWLEDGE_BASE_LINK),
    governanceCentre: () => navigateToGovernanceCentre(),
    airdrop: () => navigateToAirdrop(),
  }
}
