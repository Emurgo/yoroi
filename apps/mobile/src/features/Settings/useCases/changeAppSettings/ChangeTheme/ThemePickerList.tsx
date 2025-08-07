import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList} from 'react-native'

import {supportedThemes} from '../../../../../kernel/constants'
import {useThemeStorageMaker} from '../../../../../wallets/hooks'
import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  const themeStorage = useThemeStorageMaker()
  const [_, setLocalTheme] = React.useState(themeStorage.read())
  const {selectTheme} = useTheme()

  return (
    <FlatList
      contentContainerStyle={{...a.p_lg}}
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
