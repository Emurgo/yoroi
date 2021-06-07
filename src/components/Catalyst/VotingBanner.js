// @flow

import React from 'react'
import {View, Image, TouchableOpacity} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import {Text} from '../UiKit'

import type {IntlShape} from 'react-intl'

import CatalystLogo from '../../assets/img/voting.png'

import styles from './styles/VotingBanner.style'

const messages = defineMessages({
  name: {
    id: 'components.catalyst.banner.name',
    defaultMessage: '!!!Catalyst Voting Registration',
  },
})

type Props = {|
  intl: IntlShape,
  onPress: () => void,
  disabled: boolean,
|}
const VotingBanner = ({intl, onPress, disabled}: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onPress()} disabled={disabled}>
        <View style={styles.button}>
          <Image source={CatalystLogo} />
          <Text style={styles.text}>
            {intl.formatMessage(messages.name).toLocaleUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default injectIntl(VotingBanner)
