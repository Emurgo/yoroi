import {createStackNavigator} from '@react-navigation/stack'
import {GovernanceProvider} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useGovernanceManagerMaker} from '~/features/Staking/Governance/common/helpers'
import {StakingCenter} from '~/features/Staking/Staking/StakingCenter'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {DashboardRoutes} from '~/kernel/navigation/types'
import {Dashboard} from './Dashboard'
import {FailedTxScreen} from './ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen} from './ShowSubmittedTxScreen/SubmittedTxScreen'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {palette: p, atoms} = useTheme()

  const manager = useGovernanceManagerMaker()

  return (
    <GovernanceProvider manager={manager}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(p),
          title: strings.dashboard.stakingCenterTitle,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      >
        <Stack.Screen
          name="staking-dashboard-main"
          getComponent={() => Dashboard}
          options={{
            title: meta.name,
          }}
        />

        <Stack.Screen //
          name="staking-center"
          component={StakingCenter}
        />

        <Stack.Screen //
          name="staking-submitted-tx"
          component={SubmittedTxScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen //
          name="staking-failed-tx"
          component={FailedTxScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </GovernanceProvider>
  )
}
