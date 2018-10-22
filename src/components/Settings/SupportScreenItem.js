// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Linking, TouchableHighlight} from 'react-native'

import {Text} from '../UiKit'
import {COLORS} from '../../styles/config'
import CopyIcon from '../../assets/CopyIcon'

import styles from './styles/SupportScreenItem.style'

type Props = {
  label: string,
  text: string,
  page: string,
  navigateToPage: () => any,
}

const SupportScreenItem = ({label, text, page, navigateToPage}: Props) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={navigateToPage}
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
  withHandlers({
    navigateToPage: ({page}) => () => Linking.openURL(page),
  })
)(SupportScreenItem)
