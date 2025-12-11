import {Logger} from '@yoroi/logger'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {FlatList, TextProps, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {logger} from '~/kernel/logger/logger'
import {Hr} from '~/ui/Hr/Hr'
import {Text} from '~/ui/Text/Text'

export const ListSystemLogsScreen = () => {
  const {atoms: ta} = useTheme()

  const renderLogEntry = React.useCallback(
    ({item: entry}: {item: Logger.Entry}) => {
      return (
        <View style={[a.pb_sm]}>
          <Label>
            {new Date(entry.timestamp).toLocaleDateString('en-us', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
            }) +
              '   ' +
              `${LoggerLevelEmoji[entry.level as keyof typeof LoggerLevelEmoji]}`}
          </Label>

          <Value>{entry.message}</Value>
        </View>
      )
    },
    [],
  )

  return (
    <SafeAreaView
      style={[a.flex_1, a.pt_lg, ta.bg_color_max]}
      edges={['bottom', 'right', 'left']}
    >
      <FlatList
        data={logger.trail}
        renderItem={renderLogEntry}
        keyExtractor={(item) => `log-entry-${item.id}`}
        contentContainerStyle={[a.px_lg, a.gap_sm]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Hr}
      />
    </SafeAreaView>
  )
}

const LoggerLevelEmoji = {
  [Logger.Level.Debug]: '🔍',
  [Logger.Level.Log]: '📋',
  [Logger.Level.Info]: 'ℹ️',
  [Logger.Level.Warn]: '⚠️',
  [Logger.Level.Error]: '❌',
} as const

const Label = ({style, children, ...props}: TextProps) => {
  const {atoms: ta} = useTheme()

  return (
    <Text {...props} style={[ta.text_gray_max, a.body_1_lg_medium, style]}>
      {children}
    </Text>
  )
}

const Value = ({style, children, ...props}: TextProps) => {
  const {atoms: ta} = useTheme()

  return (
    <Text {...props} style={[ta.text_gray_medium, a.body_1_lg_regular, style]}>
      {children}
    </Text>
  )
}
