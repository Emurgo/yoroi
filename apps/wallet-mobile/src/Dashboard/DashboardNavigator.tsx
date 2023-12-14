/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React, {useMemo} from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {DashboardRoutes, defaultStackNavigationOptions, useWalletNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {DelegationConfirmation} from '../Staking'
import {StakingCenter} from '../Staking/StakingCenter'
import {useWalletName} from '../yoroi-wallets/hooks'
import {Dashboard} from './Dashboard'
import {governanceApiMaker, governanceManagerMaker, GovernanceProvider} from '@yoroi/staking'
import {CardanoMobile} from '../yoroi-wallets/wallets'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const strings = useStrings()

  const {networkId} = useSelectedWallet()
  const manager = useMemo(
    () =>
      governanceManagerMaker({
        walletId: wallet.id,
        networkId,
        api: governanceApiMaker({networkId}),
        cardano: CardanoMobile,
        storage: AsyncStorage,
      }),
    [networkId, wallet.id],
  )

  return (
    <GovernanceProvider manager={manager}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
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
