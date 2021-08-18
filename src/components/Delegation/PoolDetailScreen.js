// @flow

import React from 'react'

import {View} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, Button} from '../UiKit'

import styles from './styles/PoolDetailScreen.style'

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Attention',
  },
})

type Props = {|
  intl: IntlShape,
  onPressDelegate: () => any,
  isDisabled: ?boolean,
|}

const PoolDetailScreen = ({intl, onPressDelegate, isDisabled = false}: Props) => {
  const delegateButtonTitle = intl.formatMessage(messages.delegate)

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>Nightly POOL</Text>
      </View>
      <View style={styles.buttons}>
        <Button
          outlineOnLight
          outline
          onPress={onPressDelegate}
          title={delegateButtonTitle}
          style={styles.button}
          disabled={isDisabled}
        />
      </View>
    </View>
  )
}

export default injectIntl(PoolDetailScreen)
