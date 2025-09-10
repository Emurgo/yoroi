import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {FlatList} from 'react-native'

import {supportedThemes} from '~/kernel/constants'

import {ThemePickerItem} from './ThemePickerItem'

export const ThemePickerList = () => {
  return (
    <FlatList
      contentContainerStyle={{...a.p_lg}}
      data={Object.entries(supportedThemes).map(([, v]) => ({themeName: v}))}
      keyExtractor={({themeName}) => themeName}
      renderItem={({item: {themeName}}) => {
        return <ThemePickerItem title={themeName} />
      }}
    />
  )
}
