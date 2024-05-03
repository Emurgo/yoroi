import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  const {name, selectThemeName, data} = useTheme()

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={({themeName}) => themeName}
      renderItem={({item: {themeName}}) => {
        console.log('ThemePickerList themeName', themeName)
        return <ThemePickerItem isSelected={themeName === name} title={themeName} selectTheme={selectThemeName} />
      }}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
})
