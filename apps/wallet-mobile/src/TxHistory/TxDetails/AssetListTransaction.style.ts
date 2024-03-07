import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'

export const useAssetListStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    assetHeading: {
      color: color.gray.max,
      opacity: 0.5,
      ...typography['body-3-s-regular'],
    },
    assetMeta: {
      color: color.gray[500],
      opacity: 0.5,
      ...typography['body-2-m-regular'],
    },
    assetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'red',
    },
    assetTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      backgroundColor: 'red',
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
