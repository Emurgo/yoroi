import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Animated, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../Icon'

type Props = {
  label: string
  content: string
  disabled?: boolean
}

export const ExpandableItem = ({label, content, disabled}: Props) => {
  const [expanded, setExpanded] = React.useState(false)
  const {atoms: ta, palette: p} = useTheme()
  const animatedHeight = React.useRef(new Animated.Value(0)).current
  const contentHeight = React.useRef(0)

  const toggleExpand = () => {
    setExpanded(!expanded)
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : contentHeight.current,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const onContentLayout = (event: any) => {
    contentHeight.current = event.nativeEvent.layout.height
    if (expanded) {
      animatedHeight.setValue(contentHeight.current)
    }
  }

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.5}
    >
      <View>
        <View style={[a.flex_row, a.align_center, a.justify_center, a.p_md]}>
          <Text style={[disabled && ta.text_gray_medium]}>{label}</Text>

          <Icon.Chevron
            size={23}
            direction={expanded ? 'up' : 'down'}
            color={p.el_gray_medium}
          />
        </View>

        <Animated.View style={[a.p_lg, {height: animatedHeight, overflow: 'hidden'}]}>
          <View onLayout={onContentLayout}>
            <Text>{content}</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}
