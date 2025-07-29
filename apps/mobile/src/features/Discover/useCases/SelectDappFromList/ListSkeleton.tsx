import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {Space} from '~/ui/Space/Space'
import {
  DAppCountConnectedSkeleton,
  DAppItemSkeleton,
  DAppTabSkeleton,
} from './DAppListItem/DAppItemSkeleton'

export const ListSkeleton = () => {
  const {palette: p} = useTheme()
  return (
    <ScrollView style={[a.p_lg, a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <DAppTabSkeleton />

      <Space.Height.md />

      <DAppCountConnectedSkeleton />

      <Space.Height.md />

      {Array.from({length: 7}).map((_, index) => (
        <View key={index}>
          <DAppItemSkeleton />

          <Space.Height.md />
        </View>
      ))}
    </ScrollView>
  )
}
