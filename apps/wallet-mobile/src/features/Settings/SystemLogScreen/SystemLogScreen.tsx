import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet, TextProps, View} from 'react-native'

import {Text} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {logger} from '../../../kernel/logger/logger'
import {LoggerLevel} from '../../../kernel/logger/types'

export const SystemLogScreen = () => {
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <ScrollView>
        {logger.trail.map((entry) => {
          return (
            <View key={`log-entry-${entry.id}`}>
              <LabelText>
                {new Date(entry.timestamp).toLocaleDateString('en-us', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                }) +
                  ' ' +
                  `${LoggerLevelEmoji[entry.level]}`}
              </LabelText>

              <ValueText>{entry.message}</ValueText>

              <Space height="lg" />
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const LoggerLevelEmoji = {
  [LoggerLevel.Debug]: '🔍',
  [LoggerLevel.Log]: '📋',
  [LoggerLevel.Info]: 'ℹ️',
  [LoggerLevel.Warn]: '⚠️',
  [LoggerLevel.Error]: '❌',
} as const

const LabelText = ({style, children, ...props}: TextProps) => {
  const styles = useStyles()

  return (
    <Text {...props} style={[styles.labelText, style]}>
      {children}
    </Text>
  )
}

const ValueText = ({style, children, ...props}: TextProps) => {
  const styles = useStyles()

  return (
    <Text {...props} style={[styles.valueText, style]}>
      {children}
    </Text>
  )
}
const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.px_lg,
    },
    labelText: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    valueText: {
      color: color.gray_c500,
      ...atoms.body_1_lg_regular,
    },
  })

  return styles
}
