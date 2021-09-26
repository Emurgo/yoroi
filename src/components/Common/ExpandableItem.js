// @flow

import React from 'react'
import {TouchableOpacity, View, Image} from 'react-native'

import {Text} from '../UiKit'
import chevronDown from '../../assets/img/chevron_down.png'
import chevronUp from '../../assets/img/chevron_up.png'

import styles from './styles/ExpandableItem.style'

type Props = {
  label: string,
  content: string,
  disabled?: boolean,
  style?: Object,
}

export const ExpandableItem = ({label, content, disabled, style}: Props) => {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.5}>
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
}

export default ExpandableItem
