import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useBaseStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray.min,
      ...typography['body-3-s-regular'],
      opacity: 0.5,
    },
    assetMeta: {
      color: color.gray.min,
      ...typography['body-2-m-regular'],
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
      ...typography['body-2-m-regular'],
      color: color.gray.min,
      marginBottom: 2,
    },
    assetBalance: {
      ...typography['body-2-m-regular'],
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
