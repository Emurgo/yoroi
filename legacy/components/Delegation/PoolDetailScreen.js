// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {View} from 'react-native'

import {Button, Text, TextInput} from '../UiKit'
import styles from './styles/PoolDetailScreen.style'

const messages = defineMessages({
  delegate: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  title: {
    id: 'components.stakingcenter.pooldetailscreen.title',
    defaultMessage: '!!!Nightly delegation',
  },
  poolHash: {
    id: 'global.staking.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
})

type Props = {|
  intl: IntlShape,
  onPressDelegate: (poolHash?: string) => any,
  disabled: ?boolean,
|}

const PoolDetailScreen = ({intl, onPressDelegate, disabled = false}: Props) => {
  const delegateButtonTitle = intl.formatMessage(messages.delegate)
  const title = intl.formatMessage(messages.title)
  const poolLabel = intl.formatMessage(messages.poolHash)
  const [poolHash, setPoolHash] = React.useState('')

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <TextInput label={poolLabel} value={poolHash} onChangeText={setPoolHash} />
      <Button
        outlineOnLight
        outline
        onPress={() => onPressDelegate(poolHash)}
        title={delegateButtonTitle}
        style={styles.button}
        disabled={disabled}
      />
    </View>
  )
}

export default injectIntl(PoolDetailScreen)
