import React from 'react'
import {StyleSheet, View} from 'react-native'

export const LayoutGrid = ({children}: {children: React.ReactNode}) => {
  return (
    <>
      {children}

      <View style={[StyleSheet.absoluteFill, {flexDirection: 'row'}]}>
        <Margin />

        <Column />
        <Gutter />
        <Column />
        <Gutter />
        <Column />
        <Gutter />
        <Column />
        <Gutter />
        <Column />
        <Gutter />
        <Column />

        <Margin />
      </View>
    </>
  )
}

const commonStyles = {
  opacity: 0.5,
}

const Margin = () => <View style={[commonStyles, {width: 16, backgroundColor: 'mediumspringgreen'}]} />
const Column = () => <View style={[commonStyles, {flex: 8, backgroundColor: 'pink'}]} />
const Gutter = () => <View style={[commonStyles, {flex: 1, backgroundColor: 'cyan', opacity: 0.5}]} />
