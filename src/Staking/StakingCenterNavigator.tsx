import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import DelegationConfirmation from '../../legacy/components/Delegation/DelegationConfirmation'
import {SettingsButton} from '../components/Button'
import {AppRouteParams, defaultBaseNavigationOptions, StakingCenterRoutes} from '../navigation'
import {StakingCenter} from './StakingCenter/StakingCenter'

const Stack = createStackNavigator<StakingCenterRoutes>()
export const StakingCenterNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator screenOptions={defaultBaseNavigationOptions}>
      <Stack.Screen
        name="staking-center-main"
        component={StakingCenter}
        options={({navigation}: {navigation: AppRouteParams}) => ({
          title: strings.title,
          headerRight: () => (
            <SettingsButton
              onPress={() =>
                navigation.navigate('app-root', {
                  screen: 'settings',
                  params: {
                    screen: 'settings-main',
                  },
                })
              }
            />
          ),
          headerRightContainerStyle: {paddingRight: 16},
        })}
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
