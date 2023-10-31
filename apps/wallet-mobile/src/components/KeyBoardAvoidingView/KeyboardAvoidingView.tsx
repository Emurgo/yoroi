import React from 'react'
import {KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle} from 'react-native'

type Props = {
  children: React.ReactNode
  notHiddenContent: React.ReactNode
  keyboardVerticalOffset?: number
  scrollEnabled?: boolean
  contentContainerStyle?: ViewStyle
}

export const KeyboardAvoidingView = ({
  children,
  notHiddenContent,
  keyboardVerticalOffset = 86,
  scrollEnabled = true,
  contentContainerStyle,
}: Props) => {
  return (
    <RNKeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.flex, contentContainerStyle]}
        bounces={false}
        scrollEnabled={scrollEnabled}
      >
        {children}
      </ScrollView>

      {notHiddenContent}
    </RNKeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
