// @flow

import React from 'react'
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'

import type {IntlShape} from 'react-intl'

import CatalystLogo from '../../assets/img/voting.png'

const messages = defineMessages({
  name: {
    id: 'components.catalyst.banner.name',
    defaultMessage: '!!!Catalyst Voting Registration',
  },
})

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_POSITIVE_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
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
          <Text style={styles.text}>{intl.formatMessage(messages.name).toLocaleUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default injectIntl(VotingBanner)
