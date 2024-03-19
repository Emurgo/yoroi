import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useSendStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray.max,
      opacity: 0.5,
      ...typography['body-3-s-regular'],
    },
    assetMeta: {
      color: color.gray[500],
      opacity: 1,
      ...typography['body-2-m-regular'],
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
      ...padding['x-l'],
      ...padding['y-m'],
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
      ...padding['y-s'],
    },
    px5: {
      ...padding['x-l'],
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
