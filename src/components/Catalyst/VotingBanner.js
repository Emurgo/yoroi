// @flow

import React from 'react'
import {View, Text, Image, TouchableOpacity} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'

import CatalystLogo from '../../assets/img/voting.png'

import styles from './styles/VotingBanner.style'
const messages = defineMessages({
  name: {
    id: 'components.catalyst.banner.name',
    defaultMessage: '!!!Catalyst Voting',
  },
})

const VotingBanner = ({intl, onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onPress()}>
        <Image source={CatalystLogo} />
        <Text>{intl.formatMessage(messages.name).toLocaleUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  )
}

type ExternalProps = {|intl: IntlShape, onPress: () => void|}

export default injectIntl((VotingBanner: ComponentType<ExternalProps>))
