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
  disabled?: ?boolean,
}

const DelegationNavigationButtons = ({intl, onPress, disabled}: Props) => (
  <View style={styles.container}>
    <Button
      block
      shelleyTheme
      onPress={onPress}
      title={intl.formatMessage(messages.stakingCenterButton)}
      disabled={disabled}
    />
  </View>
)

export default injectIntl(DelegationNavigationButtons)
