// @flow

import React from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {SHELLEY_WALLET_ROUTES} from '../../RoutesList'
import {Button} from '../UiKit'

import styles from './styles/DelegationNavigator.style'

import iconStakingCenter from '../../assets/img/icon/receive.png'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!StakingCenter',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  navigateToStakingCenter: () => mixed,
  intl: any,
}

const DelegationNavigationButtons = ({
  navigation,
  navigateToStakingCenter,
  intl,
}: Props) => (
  <View style={styles.container}>
    <Button
      block
      onPress={navigateToStakingCenter}
      title={intl.formatMessage(messages.stakingCenterButton)}
      style={styles.mainButton}
      iconImage={iconStakingCenter}
    />
  </View>
)

export default injectIntl(
  compose(
    withHandlers({
      navigateToStakingCenter: ({navigation}) => (event) =>
        navigation.navigate(SHELLEY_WALLET_ROUTES.STAKING_CENTER),
    }),
  )(DelegationNavigationButtons),
)
