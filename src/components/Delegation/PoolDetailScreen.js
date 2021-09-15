// @flow

import React from 'react'

import {View} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'

import {Text, Button} from '../UiKit'

import styles from './styles/PoolDetailScreen.style'

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Attention',
  },
  title: {
    id: 'components.stakingcenter.pooldetailscreen.title',
    defaultMessage: '!!!Attention',
  },
})

type Props = {|
  onPressDelegate: () => any,
  disabled: ?boolean,
|}

const PoolDetailScreen = ({onPressDelegate, disabled = false}: Props) => {
  const intl = useIntl()
  const delegateButtonTitle = intl.formatMessage(messages.delegate)
  const title = intl.formatMessage(messages.title)

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.buttons}>
        <Button
          outlineOnLight
          outline
          onPress={onPressDelegate}
          title={delegateButtonTitle}
          style={styles.button}
          disabled={disabled}
        />
      </View>
    </View>
  )
}

export default PoolDetailScreen
