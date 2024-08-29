import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useSendStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray_max,
      opacity: 0.5,
      ...atoms.body_3_sm_regular,
    },
    assetMeta: {
      color: color.gray_500,
      opacity: 1,
      ...atoms.body_2_md_regular,
    },
    assetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    },
    assetTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      ...atoms.px_lg,
      ...atoms.py_md,
      backgroundColor: color.bg_color_max,
      borderTopWidth: 1,
      borderBottomWidth: 2,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    },
    assetName: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
      marginBottom: 2,
    },
    assetBalanceView: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    assetBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
    py5: {
      ...atoms.py_sm,
    },
    px5: {
      ...atoms.px_lg,
    },
    rowColor1: {
      backgroundColor: 'transparent',
    },
    rowColor2: {
      backgroundColor: color.primary_100,
    },
    tokenMetaView: {
      flex: 2,
    },
  })
  return styles
}
