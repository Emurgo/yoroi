import * as React from 'react'
import {ReactNode} from 'react'
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg'

import {Spacer} from '../Spacer'

export type BlueCheckboxProps = {
  checked?: boolean
  onPress?: () => void
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  spacing?: number
}

export const BlueCheckbox = ({checked, onPress, children, style, spacing = 15}: BlueCheckboxProps) => {
  return (
    <TouchableOpacity style={[styles.checkboxRow, style]} onPress={onPress} testID="checkboxSelect">
      {checked ? <CheckboxChecked /> : <CheckboxNotChecked />}

      <Spacer width={spacing} />

      <View style={styles.textRow}>{children}</View>
    </TouchableOpacity>
  )
}

const CheckboxChecked = () => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_6368_1632)">
        <Rect y={0.000671387} width={16} height={16} rx={2} fill="#4B6DDE" />

        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.857 11L4 8.123l.806-.812L6.857 9.37l4.337-4.37.806.817-5.143 5.183z"
          fill="#fff"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_6368_1632">
          <Rect y={0.000671387} width={16} height={16} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

const CheckboxNotChecked = () => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_6368_454)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z"
          fill="#383E54"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_6368_454">
          <Rect y={0.000610352} width={16} height={16} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
})
