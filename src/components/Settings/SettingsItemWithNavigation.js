// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Linking, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'
import CopyIcon from '../../assets/CopyIcon'

import styles from './styles/SettingsItemWithNavigation.style'

type Props = {
  label: string,
  text: string,
  navigateTo: string,
  navigate: () => any,
}

const SettingsItemWithNavigation = ({label, text, navigateTo, navigate}: Props) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={navigate}
  >
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.iconContainer}>
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </View>
    </View>
  </TouchableHighlight>
)

export default compose(
  withNavigation,
  withHandlers({
    navigate: ({navigation, navigateTo}) => () => {
      if (navigateTo.substring(0, 4) === 'http') {
        Linking.openURL(navigateTo)
      } else {
        navigation.navigate(navigateTo)
      }
    },
  })
)(SettingsItemWithNavigation)
