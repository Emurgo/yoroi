import {useTheme} from '@yoroi/theme'
import React from 'react'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Text} from '../..'

type Props = {
  label: string
  content: string
  disabled?: boolean
  style?: Record<string, unknown>
}

export const ExpandableItem = ({label, content, disabled, style}: Props) => {
  const [expanded, setExpanded] = React.useState(false)
  const {styles, colors} = useStyles()

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
          <Text secondary style={[disabled && styles.disabled]}>
            {label}
          </Text>

          <Icon.Chevron size={23} direction={expanded ? 'up' : 'down'} color={colors.icon} />
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    labelWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.p_md,
    },
    disabled: {
      color: color.gray_c600,
    },
    contentWrapper: {
      ...atoms.p_lg,
    },
  })

  return {styles, colors: {icon: color.gray_cmax}} as const
}
