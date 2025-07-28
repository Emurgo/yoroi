import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList} from 'react-native'

import {useThemeStorageMaker} from '~/wallets/hooks'
import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  const themeStorage = useThemeStorageMaker()
  const [_, setLocalTheme] = React.useState(themeStorage.read())
  const {selectThemeName, data} = useTheme()

  return (
    <FlatList
      contentContainerStyle={{padding: 16}}
      data={data}
      keyExtractor={({themeName}) => themeName}
      renderItem={({item: {themeName}}) => {
        return (
          <ThemePickerItem
            title={themeName}
            selectTheme={selectThemeName}
            setLocalTheme={setLocalTheme}
          />
        )
      }}
    />
  )
}
