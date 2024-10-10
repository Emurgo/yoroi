import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {useThemeStorageMaker} from '../../../../../yoroi-wallets/hooks'
import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  const themeStorage = useThemeStorageMaker()
  const [_, setLocalTheme] = React.useState(themeStorage.read())
  const {selectThemeName, data} = useTheme()

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={({themeName}) => themeName}
      renderItem={({item: {themeName}}) => {
        return <ThemePickerItem title={themeName} selectTheme={selectThemeName} setLocalTheme={setLocalTheme} />
      }}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
})
