import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useBaseStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray_cmin,
      ...atoms.body_3_sm_regular,
      opacity: 0.5,
    },
    assetMeta: {
      color: color.gray_cmin,
      ...atoms.body_2_md_regular,
      opacity: 0.5,
    },
    assetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    assetTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    assetBalanceView: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    assetName: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmin,
      marginBottom: 2,
    },
    assetBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmin,
    },
    py5: {
      paddingVertical: 10,
    },
    px5: {
      paddingHorizontal: 0,
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
