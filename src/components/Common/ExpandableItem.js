// @flow

import React from 'react'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {TouchableOpacity, View, Image} from 'react-native'

import {Text} from '../UiKit'
import chevronDown from '../../assets/img/chevron_down.png'
import chevronUp from '../../assets/img/chevron_up.png'

import styles from './styles/ExpandableItem.style'

import type {ComponentType} from 'react'

type Props = {
  label: string,
  content: string,
  disabled?: boolean,
  onPress: () => void,
  expanded: boolean,
  style?: Object,
}

export const ExpandableItem = ({label, content, disabled, onPress, expanded, style}: Props) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.5}>
    <View style={style}>
      <View style={styles.labelWrapper}>
        <Text secondary style={[disabled === true && styles.disabled]}>
          {label}
        </Text>
        <Image style={styles.icon} source={expanded ? chevronUp : chevronDown} />
      </View>
      {expanded && (
        <View style={styles.contentWrapper}>
          <Text>{content}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
)

type ExternalProps = {
  label: string,
  content: string,
  disabled?: boolean,
  style?: Object,
}

export default (compose(
  withStateHandlers(
    {
      expanded: false,
    },
    {
      onPress: (state) => () => ({expanded: !state.expanded}),
    },
  ),
)(ExpandableItem): ComponentType<ExternalProps>)
