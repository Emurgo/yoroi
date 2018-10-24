// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Linking, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'

import styles from './styles/SettingsItem.style'

import type {Node} from 'react'

type Props = {
  title?: string,
  description: string,
  dstScreen?: string,
  dstUrl?: string,
  onPress: () => any,
  children: Node,
}

const SettingsItem = ({
  title,
  description,
  dstScreen,
  dstUrl,
  onPress,
  children,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.text}>{description}</Text>
    </View>
    <View style={styles.iconContainer}>
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor={COLORS.WHITE}
        onPress={onPress}
      >
        {children}
      </TouchableHighlight>
    </View>
  </View>
)

export default compose(
  withNavigation,
  withHandlers({
    onPress: ({navigation, dstScreen, dstUrl}) => () => {
      if (dstScreen) {
        navigation.navigate(dstScreen)
      }
      if (dstUrl) {
        Linking.openURL(dstUrl)
      }
    },
  }),
)(SettingsItem)
