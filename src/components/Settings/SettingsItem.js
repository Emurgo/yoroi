// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Linking, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'
import CopyIcon from '../../assets/CopyIcon'

import styles from './styles/SettingsItem.style'

type Props = {
  title: string,
  description: string,
  dstScreen?: string,
  dstUrl?: string,
  onPress: () => any,
}

const SettingsItem = ({
  title,
  description,
  dstScreen,
  dstUrl,
  onPress,
}: Props) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={onPress}
  >
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.text}>{description}</Text>
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
    onPress: ({navigation, dstScreen, dstUrl}) => () => {
      if (dstScreen) {
        navigation.navigate(dstScreen)
      } else if (dstUrl) {
        Linking.openURL(dstUrl)
      }
    },
  }),
)(SettingsItem)
