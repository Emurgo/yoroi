import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useAssetListStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.text_gray_medium,
      ...atoms.body_2_md_regular,
    },
    assetMeta: {
      color: color.text_gray_medium,
      ...atoms.link_1_lg,
    },
    assetRow: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    assetTitle: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      marginBottom: 10,
    },
    assetName: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
      marginBottom: 2,
    },
    assetBalanceView: {
      ...atoms.flex_1,
      ...atoms.align_end,
      ...atoms.justify_start,
    },
    assetBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
    py5: {
      paddingVertical: 10,
    },
    px5: {
      ...atoms.px_0,
    },
    rowColor1: {
      backgroundColor: 'transparent',
    },
    rowColor2: {
      backgroundColor: 'transparent',
    },
    tokenMetaView: {
      flex: 2,
    },
  })
  return styles
}
