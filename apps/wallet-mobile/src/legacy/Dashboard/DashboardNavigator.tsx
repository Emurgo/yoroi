/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import {GovernanceProvider} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../../components/Button'
import {useGovernanceManagerMaker} from '../../features/Staking/Governance'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {DashboardRoutes, defaultStackNavigationOptions, useWalletNavigation} from '../../kernel/navigation'
import {DelegationConfirmation, FailedTxScreen} from '../Staking'
import {StakingCenter} from '../Staking/StakingCenter'
import {Dashboard} from './Dashboard'
import {NetworkTag} from '../../features/Settings/ChangeNetwork/NetworkTag'
import {LoadingBoundary} from '../../components'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {color, atoms} = useTheme()

  const manager = useGovernanceManagerMaker()

  return (
    <GovernanceProvider manager={manager}>
      <Stack.Navigator screenOptions={defaultStackNavigationOptions(atoms, color)}>
        <Stack.Screen
          name="staking-dashboard-main"
          component={Dashboard}
          options={{
            title: meta.name,
            headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
            headerRight: () => <HeaderRight />,
          }}
        />

        <Stack.Screen //
          name="staking-center"
          options={{title: strings.title, headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>}}
        >
          {() => (
            <LoadingBoundary>
              <StakingCenter />
            </LoadingBoundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="delegation-confirmation"
          component={DelegationConfirmation}
          options={{title: strings.title, headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>}}
        />

        <Stack.Screen
          name="delegation-failed-tx"
          component={FailedTxScreen}
          options={{title: strings.title, headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>}}
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
