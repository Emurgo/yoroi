import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {defaultStackNavigationOptions, StakingCenterRoutes, useWalletNavigation} from '../navigation'
import {DelegationConfirmation} from './DelegationConfirmation'
import {StakingCenter} from './StakingCenter/StakingCenter'

const Stack = createStackNavigator<StakingCenterRoutes>()

export const StakingCenterNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions}>
      <Stack.Screen
        name="staking-center-main"
        component={StakingCenter}
        options={{
          title: strings.title,
          headerRight: () => <HeaderRight />,
          headerRightContainerStyle: {paddingRight: 16},
        }}
      />

      <Stack.Screen
        name="delegation-confirmation"
        component={DelegationConfirmation}
        options={{title: strings.title}}
      />
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    delegationConfirmationTitle: intl.formatMessage(messages.delegationConfirmationTitle),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
  delegationConfirmationTitle: {
    id: 'components.stakingcenter.confirmDelegation.title',
    defaultMessage: '!!!Confirm delegation',
  },
})

const HeaderRight = () => {
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsButton onPress={() => navigateToSettings()} />
}
