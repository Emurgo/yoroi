import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {AssetTokenImage} from './AssetTokenImage'
import {useStrings} from './useStrings'

type Props = {
  emptyText?: string
}

export const TokenEmptyList = ({emptyText}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.containerAssetToken}>
      <View style={styles.boxAssetToken}>
        <AssetTokenImage />
      </View>

      <Text style={styles.textEmpty}>{emptyText ?? strings.noTokensFound}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    boxAssetToken: {
      width: 280,
      height: 280,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    containerAssetToken: {
      ...atoms.flex_col,
      ...atoms.justify_center,
      ...atoms.align_center,
      ...atoms.w_full,
      ...atoms.gap_lg,
      ...atoms.h_full,
    },
    textEmpty: {
      ...atoms.heading_3_medium,
      ...atoms.font_semibold,
    },
  })

  return {styles} as const
}
