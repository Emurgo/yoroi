import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

import {brand} from '../../theme'

export const useBaseStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray.min,
      opacity: 0.5,
      fontSize: 10,
    },
    assetMeta: {
      color: color.gray.min,
      opacity: 0.5,
      fontSize: 14,
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
      fontFamily: brand.defaultFont,
      fontSize: 14,
      color: color.gray.min,
      marginBottom: 2,
    },
    assetBalance: {
      fontFamily: brand.defaultFont,
      fontSize: 14,
      color: color.gray.min,
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
