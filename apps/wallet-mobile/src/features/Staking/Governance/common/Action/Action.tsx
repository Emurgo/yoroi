import {isNonNullable} from '@yoroi/common'
import React, {ReactNode} from 'react'
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer, Text} from '../../../../../components'

type Props = {
  title: string
  description: string
  onPress?(): void
  pending?: boolean
  children?: ReactNode
  showRightArrow?: boolean
}

export const Action = ({title, description, onPress, pending, children, showRightArrow}: Props) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={pending}>
      <LinearGradient start={{x: 0, y: 0}} end={{x: 0, y: 1}} colors={['#E4E8F7', '#C6F7F7']} style={styles.gradient}>
        {pending && (
          <View style={styles.icon}>
            <ActivityIndicator color="black" size="small" />
          </View>
        )}

        {showRightArrow && (
          <View style={styles.icon}>
            <Icon.ArrowRight size={24} />
          </View>
        )}

        <View style={styles.root}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          {isNonNullable(children) && (
            <>
              <Spacer height={16} />

              {children}
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  gradient: {
    borderRadius: 8,
    position: 'relative',
  },
  root: {
    padding: 16,
    minHeight: 134,
  },
  title: {
    color: '#000000',
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 26,
  },
  description: {
    color: '#000000',
    fontFamily: 'Rubik-Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
})
