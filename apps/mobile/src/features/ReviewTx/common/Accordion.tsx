import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, Easing, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '~/ui/Icon'

export const Accordion = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = React.useState(true)
  const animatedHeight = React.useRef(new Animated.Value(1)).current
  const {palette: p} = useTheme()

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
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={toggleSection}
        style={[a.flex_row, a.justify_between]}
      >
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {label}
        </Text>

        <Icon.Chevron
          direction={isOpen ? 'up' : 'down'}
          size={28}
          color={p.gray_900}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          {overflow: 'hidden'},
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 0.9, 1],
              outputRange: [0, 1000, 9999999], // can't mix numbers and strings, and appending % to the result is crashing the app, so just use a BIG number
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
