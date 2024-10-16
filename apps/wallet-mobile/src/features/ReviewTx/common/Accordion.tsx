import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, Easing, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'

export const Accordion = ({label, children}: {label: string; children: React.ReactNode}) => {
  const {styles, colors} = useStyles()
  const [isOpen, setIsOpen] = React.useState(false)
  const animatedHeight = React.useRef(new Animated.Value(0)).current

  const toggleSection = () => {
    setIsOpen(!isOpen)
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.ease,
    }).start()
  }

  return (
    <View>
      <TouchableOpacity activeOpacity={0.5} onPress={toggleSection} style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{label}</Text>

        <Icon.Chevron direction={isOpen ? 'up' : 'down'} size={28} color={colors.chevron} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.childrenContainer,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    sectionHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    sectionHeaderText: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    childrenContainer: {
      overflow: 'hidden',
    },
  })

  const colors = {
    chevron: color.gray_900,
  }

  return {styles, colors} as const
}
