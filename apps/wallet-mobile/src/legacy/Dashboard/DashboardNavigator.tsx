/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import {GovernanceProvider} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {NetworkTag} from '../../features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useGovernanceManagerMaker} from '../../features/Staking/Governance/common/helpers'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {DashboardRoutes, defaultStackNavigationOptions} from '../../kernel/navigation'
import {FailedTxScreen} from '../Staking/FailedTx/FailedTxScreen'
import {StakingCenter} from '../Staking/StakingCenter'
import {Dashboard} from './Dashboard'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {color, atoms} = useTheme()

  const manager = useGovernanceManagerMaker()

  return (
    <GovernanceProvider manager={manager}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, color),
          title: strings.title,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      >
        <Stack.Screen
          name="staking-dashboard-main"
          component={Dashboard}
          options={{
            title: meta.name,
          }}
        />

        <Stack.Screen //
          name="staking-center"
          component={StakingCenter}
        />

        <Stack.Screen name="delegation-failed-tx" component={FailedTxScreen} />
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
