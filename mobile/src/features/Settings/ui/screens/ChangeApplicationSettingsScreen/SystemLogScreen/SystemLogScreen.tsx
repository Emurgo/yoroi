import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'

import * as React from 'react'
import {ScrollView, TextProps, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {logger} from '~/kernel/logger/logger'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const SystemLogScreen = () => {
  return (
    <SafeAreaView style={[a.flex_1, a.px_lg]}>
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

              <Space.Height.lg />
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const LoggerLevelEmoji = {
  [App.Logger.Level.Debug]: '🔍',
  [App.Logger.Level.Log]: '📋',
  [App.Logger.Level.Info]: 'ℹ️',
  [App.Logger.Level.Warn]: '⚠️',
  [App.Logger.Level.Error]: '❌',
} as const

const LabelText = ({style, children, ...props}: TextProps) => {
  const {atoms: ta} = useTheme()

  return (
    <Text {...props} style={[ta.text_gray_max, a.body_1_lg_medium, style]}>
      {children}
    </Text>
  )
}

const ValueText = ({style, children, ...props}: TextProps) => {
  const {atoms: ta} = useTheme()

  return (
    <Text {...props} style={[ta.text_gray_medium, a.body_1_lg_regular, style]}>
      {children}
    </Text>
  )
}
