import {ThemeName, atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {supportedThemes} from '~/kernel/constants'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Hr} from '~/ui/Hr/Hr'

import {ThemeItem} from './ThemeItem'

export const SelectThemeScreen = () => {
  const {selectTheme, config} = useTheme()

  const {track} = useMetrics()

  const handleOnSelectTheme = (theme: ThemeName) => {
    track.themeSelected({
      theme:
        theme === 'default-light'
          ? 'light'
          : theme === 'default-dark'
            ? 'dark'
            : 'auto',
    })
    selectTheme(theme)
  }
  const themes = Object.entries(supportedThemes).map(([, v]) => ({
    themeName: v,
  }))

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, a.pt_lg]}
    >
      <FlatList
        contentContainerStyle={a.px_lg}
        data={themes}
        keyExtractor={({themeName}) => themeName}
        ItemSeparatorComponent={Hr}
        renderItem={({item: {themeName}}) => {
          return (
            <ThemeItem
              themeName={themeName}
              isSelected={config === themeName}
              onSelectTheme={handleOnSelectTheme}
            />
          )
        }}
      />
    </SafeAreaView>
  )
}
