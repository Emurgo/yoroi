/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import {GovernanceProvider} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {useGovernanceManagerMaker} from '../features/Staking/Governance'
import {useSelectedWallet} from '../features/WalletManager/Context/SelectedWalletContext'
import {DashboardRoutes, defaultStackNavigationOptions, useWalletNavigation} from '../navigation'
import {DelegationConfirmation} from '../Staking'
import {StakingCenter} from '../Staking/StakingCenter'
import {useWalletName} from '../yoroi-wallets/hooks'
import {Dashboard} from './Dashboard'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const strings = useStrings()
  const {theme} = useTheme()

  const manager = useGovernanceManagerMaker()

  return (
    <GovernanceProvider manager={manager}>
      <Stack.Navigator screenOptions={defaultStackNavigationOptions(theme)}>
        <Stack.Screen
          name="staking-dashboard-main"
          component={Dashboard}
          options={{
            title: walletName,
            headerRight: () => <HeaderRight />,
          }}
        />

        <Stack.Screen //
          name="staking-center"
          component={StakingCenter}
          options={{title: strings.title}}
        />

        <Stack.Screen
          name="delegation-confirmation"
          component={DelegationConfirmation}
          options={{title: strings.title}}
        />
      </Stack.Navigator>
    </GovernanceProvider>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
})

const HeaderRight = () => {
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsButton style={{paddingRight: 16}} onPress={() => navigateToSettings()} />
}
