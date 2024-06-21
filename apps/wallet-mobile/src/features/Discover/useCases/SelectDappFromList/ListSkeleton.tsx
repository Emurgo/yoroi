import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {DAppCountConnectedSkeleton, DAppItemSkeleton, DAppTabSkeleton} from './DAppListItem/DAppItemSkeleton'

export const ListSkeleton = () => {
  const styles = useStyles()
  return (
    <ScrollView style={styles.root}>
      <DAppTabSkeleton />

      <Spacer height={16} />

      <DAppCountConnectedSkeleton />

      <Spacer height={16} />

      {Array.from({length: 7}).map((_, index) => (
        <View key={index}>
          <DAppItemSkeleton />

          <Spacer height={16} />
        </View>
      ))}
    </ScrollView>
  )
}
const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.gray_cmin,
      ...atoms.p_lg,
      ...atoms.flex_1,
    },
  })

  return styles
}
