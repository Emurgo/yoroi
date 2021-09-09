// @flow

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'

import CatalystLogo from '../../assets/img/voting.png'
import {COLORS} from '../../styles/config'
import {Text} from '../UiKit'

type Props = {|
  onPress: () => void,
  disabled: boolean,
|}

const VotingBanner = ({onPress, disabled}: Props) => {
  const intl = useIntl()

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

export default VotingBanner

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
