// @flow

import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import {Button} from '../UiKit'

import styles from './styles/DelegationNavigator.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  intl: any,
  onPress: () => void,
}

const DelegationNavigationButtons = ({intl, onPress}: Props) => (
  <View style={styles.container}>
    <Button
      block
      shelleyTheme
      onPress={onPress}
      title={intl.formatMessage(messages.stakingCenterButton)}
    />
  </View>
)

export default injectIntl(DelegationNavigationButtons)
