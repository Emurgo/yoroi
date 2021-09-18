// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {View} from 'react-native'

import {Button} from '../UiKit'
import styles from './styles/DelegationNavigator.style'

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

type Props = {
  intl: IntlShape,
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
