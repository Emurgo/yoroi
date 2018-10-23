// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'

import styles from './styles/SettingsLabelWithNavigation.style'

type Props = {
  label: string,
  navigateTo: string,
  navigate: () => void,
}

const SettingsLabelWithNavigation = ({label, navigateTo, navigate}: Props) => (
  <View style={styles.container}>
    <TouchableHighlight
      activeOpacity={0.9}
      underlayColor={COLORS.WHITE}
      onPress={navigate}
    >
      <Text style={styles.linkLabel}>{label}</Text>
    </TouchableHighlight>
  </View>
)

export default compose(
  withNavigation,
  withHandlers({
    navigate: ({navigation, navigateTo}) => () => navigation.navigate(navigateTo),
  })
)(SettingsLabelWithNavigation)
