// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'

import styles from './styles/SettingsLink.style'

type Props = {
  text: string,
  dstScreen: string,
  onPress: () => void,
}

const SettingsLink = ({text, dstScreen, onPress}: Props) => (
  <View style={styles.container}>
    <TouchableHighlight
      activeOpacity={0.9}
      underlayColor={COLORS.WHITE}
      onPress={onPress}
    >
      <Text style={styles.linkLabel}>{text}</Text>
    </TouchableHighlight>
  </View>
)

export default compose(
  withNavigation,
  withHandlers({
    onPress: ({navigation, dstScreen}) => () => navigation.navigate(dstScreen),
  }),
)(SettingsLink)
