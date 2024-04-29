import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useAssetListStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray_cmax,
      opacity: 0.5,
      ...atoms.body_3_sm_regular,
    },
    assetMeta: {
      color: color.gray_c500,
      opacity: 0.5,
      ...atoms.body_2_md_regular,
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
    assetName: {
      ...atoms.body_2_md_regular,
      color: color.gray_c900,
      marginBottom: 2,
    },
    assetBalanceView: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    assetBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
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
