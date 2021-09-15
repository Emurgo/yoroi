// @flow

import React from 'react'
import {View} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'

import {Button} from '../UiKit'

import styles from './styles/DelegationNavigator.style'

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

type Props = {
  onPress: () => void,
  disabled?: ?boolean,
}

const DelegationNavigationButtons = ({onPress, disabled}: Props) => {
  const intl = useIntl()

  return (
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
}

export default DelegationNavigationButtons
