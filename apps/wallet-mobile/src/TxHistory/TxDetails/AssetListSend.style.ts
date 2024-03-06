import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useSendStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray.max,
      opacity: 0.5,
      fontSize: 12,
    },
    assetMeta: {
      color: color.gray[500],
      opacity: 1,
      fontSize: 14,
    },
    assetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: 'rgba(173, 174, 182, 0.3)',
      backgroundColor: 'red',
    },
    assetTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: color.gray.min,
      borderTopWidth: 1,
      borderBottomWidth: 2,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    },
    assetName: {
      ...typography['body-2-m-regular'],
      color: color.gray[900],
      marginBottom: 2,
    },
    assetBalanceView: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    assetBalance: {
      ...typography['body-2-m-regular'],
      color: color.gray.max,
    },
    py5: {
      paddingVertical: 10,
    },
    px5: {
      paddingHorizontal: 16,
    },
    rowColor1: {
      backgroundColor: 'transparent',
    },
    rowColor2: {
      backgroundColor: color.primary[100],
    },
    tokenMetaView: {
      flex: 2,
    },
  })
  return styles
}
