import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {supportedThemes} from '../../../../../kernel/constants'
import {useThemeStorageMaker} from '../../../../../wallets/hooks'
import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  const themeStorage = useThemeStorageMaker()
  const [_, setLocalTheme] = React.useState(themeStorage.read())
  const {selectTheme} = useTheme()

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={Object.entries(supportedThemes).map(([k, v]) => ({themeName: v}))}
      keyExtractor={({themeName}) => themeName}
      renderItem={({item: {themeName}}) => {
        return (
          <ThemePickerItem
            title={themeName}
            selectTheme={selectTheme}
            setLocalTheme={setLocalTheme}
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
})
