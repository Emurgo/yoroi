import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {DAppItemSkeleton} from './DAppListItem/DAppItemSkeleton'

export const ListSkeleton = () => {
  const styles = useStyles()
  return (
    <View style={styles.root}>
      <ScrollView>
        {Array.from({length: 7}).map((_, index) => (
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    dAppsBox: {
      height: 16,
    },
    dAppItemBox: {
      ...atoms.p_lg,
    },
  })

  return styles
}
