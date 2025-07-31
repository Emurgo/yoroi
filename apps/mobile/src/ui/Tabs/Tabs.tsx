import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native'

import {Text} from '../Text/Text'

export const Tabs = ({children, style}: ViewProps) => {
  const {atoms: ta, palette: p} = useTheme()
  return <View style={[a.flex_row, style]}>{children}</View>
}

export const Tab = ({
  onPress,
  active,
  label,
  testID,
  style,
}: TouchableOpacityProps & {active: boolean; label: string}) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[a.align_center, a.justify_center, a.py_sm, a.flex_1, style]}
      onPress={onPress}
      testID={testID}
    >
      <View style={[a.align_center, a.justify_center]}>
        <Text
          style={[
            a.body_1_lg_medium,
            active ? {color: p.primary_600} : {color: p.gray_600},
          ]}
        >
          {label}
        </Text>
      </View>

      {active && (
        <View
          style={[
            a.absolute,
            {bottom: 0, height: 2, width: '100%'},
            {borderTopLeftRadius: 2, borderTopRightRadius: 2},
            {backgroundColor: p.primary_600},
          ]}
        />
      )}
    </TouchableOpacity>
  )
}

export const TabPanels = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View
      style={[
        a.flex_1,
        a.pt_sm,
        {backgroundColor: p.bg_color_max},
        {borderTopLeftRadius: 8, borderTopRightRadius: 8},
      ]}
    >
      {children}
    </View>
  )
}

export const TabPanel = ({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) => <>{active ? children : null}</>
