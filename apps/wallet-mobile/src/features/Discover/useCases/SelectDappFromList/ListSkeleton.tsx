import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {makeList} from '../../../../utils'
import {DAppItemSkeleton} from './DAppItem/DAppItemSkeleton'

export const ListSkeleton = () => {
  const styles = useStyles()
  return (
    <View style={styles.root}>
      <ScrollView>
        {makeList(7).map((_, index) => (
          <View style={styles.dAppItemBox} key={index}>
            <DAppItemSkeleton />

            <Spacer style={styles.dAppsBox} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
    },
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...theme.padding['x-l'],
    },
  })

  return styles
}
