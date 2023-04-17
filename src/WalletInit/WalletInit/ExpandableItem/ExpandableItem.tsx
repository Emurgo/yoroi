import React from 'react'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Text} from '../../../components'
import {COLORS} from '../../../theme'

type Props = {
  label: string
  content: string
  disabled?: boolean
  style?: Record<string, unknown>
}

export const ExpandableItem = ({label, content, disabled, style}: Props) => {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setExpanded(!expanded)
      }}
      activeOpacity={0.5}
    >
      <View style={style}>
        <View style={styles.labelWrapper}>
          <Text secondary style={[disabled === true && styles.disabled]}>
            {label}
          </Text>

          <Icon.Chevron size={23} direction={expanded ? 'up' : 'down'} color={COLORS.SECONDARY_TEXT} />
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

const styles = StyleSheet.create({
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  disabled: {
    color: COLORS.DISABLED,
  },
  contentWrapper: {
    padding: 16,
  },
})
