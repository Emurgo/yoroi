import React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../theme'
import {Text} from './Text'

type ExternalProps = {
  title?: string
  children: React.ReactNode
  variant?: string
}

export const TitledCard = ({title, children, variant}: ExternalProps) => (
  <View style={styles.wrapper}>
    {title !== undefined && <Text style={styles.title}>{title}</Text>}
    <View style={[styles.content, variant === 'poolInfo' ? styles.poolInfoContent : undefined]}>{children}</View>
  </View>
)

const styles = StyleSheet.create({
  wrapper: {},
  title: {
    fontSize: 16,
    height: 28,
    lineHeight: 24,
    color: COLORS.DARK_GRAY,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 2},
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: COLORS.BACKGROUND,
  },
  poolInfoContent: {
    padding: 0,
    flexDirection: 'column',
  },
})
