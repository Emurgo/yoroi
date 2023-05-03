import React from 'react'
import {View, Text, ViewStyle} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

type Side = 'top' | 'left' | 'right' | 'bottom'

export const SafeAreaInsets = ({
  sides = ['top', 'left', 'right', 'bottom'],
  children,
}: {
  sides?: Array<Side>
  children: React.ReactNode
}) => (
  <>
    {children}

    {sides.includes('top') ? <TopSafeArea /> : null}
    {sides.includes('left') ? <LeftSafeArea /> : null}
    {sides.includes('right') ? <RightSafeArea /> : null}
    {sides.includes('bottom') ? <BottomSafeArea /> : null}
  </>
)

const safeAreaStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  backgroundColor: 'yellow',
  opacity: 0.5,
}

const textStyle = {fontSize: 16}

const SAFE_AREA_WARNING = '<----------- DO NOT ENTER ----------->'

const TopSafeArea = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[safeAreaStyle, {top: 0, height: insets.top, width: '100%'}]}>
      <Text style={textStyle}>{SAFE_AREA_WARNING}</Text>
    </View>
  )
}

const LeftSafeArea = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[safeAreaStyle, {left: 0, height: '100%', width: insets.left}]}>
      <Text style={[textStyle, {transform: [{rotate: '90deg'}]}]}>{SAFE_AREA_WARNING}</Text>
    </View>
  )
}

const RightSafeArea = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[safeAreaStyle, {right: 0, height: '100%', width: insets.right}]}>
      <Text style={[textStyle, {transform: [{rotate: '90deg'}]}]}>{SAFE_AREA_WARNING}</Text>
    </View>
  )
}

const BottomSafeArea = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[safeAreaStyle, {bottom: 0, height: insets.bottom, width: '100%'}]}>
      <Text style={textStyle}>{SAFE_AREA_WARNING}</Text>
    </View>
  )
}
