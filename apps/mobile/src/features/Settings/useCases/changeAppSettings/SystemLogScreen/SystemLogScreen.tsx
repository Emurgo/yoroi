import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import React from 'react'
import {ScrollView, TextProps, View} from 'react-native'

import {logger} from '~/kernel/logger/logger'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const SystemLogScreen = () => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}, a.px_lg]}>
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
    </View>
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
  const {atoms: ta, palette: p} = useTheme()

  return (
    <Text {...props} style={[a.body_1_lg_medium, {color: p.gray_900}, style]}>
      {children}
    </Text>
  )
}

const ValueText = ({style, children, ...props}: TextProps) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <Text {...props} style={[a.body_1_lg_regular, {color: p.gray_500}, style]}>
      {children}
    </Text>
  )
}
