import {GovernanceProvider} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {FailedTxScreen} from '~/features/ReviewTx/useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen} from '~/features/ReviewTx/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useGovernanceManagerMaker} from '~/features/Staking/Governance/common/helpers'
import {StakingCenter} from '~/features/Staking/Staking/StakingCenter/StakingCenter'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {DashboardRoutes} from '~/kernel/navigation/types'

import {DashboardScreen} from '../screens/DashboardScreen'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {palette: p} = useTheme()

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
          getComponent={() => DashboardScreen}
          options={{
            title: meta.name,
          }}
        />

        <Stack.Screen //
          name="staking-center"
          getComponent={() => StakingCenter}
        />

        <Stack.Screen //
          name="staking-submitted-tx"
          getComponent={() => SubmittedTxScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen //
          name="staking-failed-tx"
          getComponent={() => FailedTxScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </GovernanceProvider>
  )
}
