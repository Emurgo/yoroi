import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export const TokenItem = ({
  isPrimaryToken = true,
  isSent = true,
  label,
}: {
  isPrimaryToken?: boolean
  isSent?: boolean
  label: string
}) => {
  const {styles} = useStyles()

  if (!isSent)
    return (
      <View style={[styles.receivedTokenItem, !isPrimaryToken && styles.notPrimaryReceivedTokenItem]}>
        <Text style={[styles.tokenReceivedItemText, !isPrimaryToken && styles.notPrimaryReceivedTokenItemText]}>
          {label}
        </Text>
      </View>
    )

  return (
    <View style={[styles.sentTokenItem, !isPrimaryToken && styles.notPrimarySentTokenItem]}>
      <Text style={[styles.tokenSentItemText, !isPrimaryToken && styles.notPrimarySentTokenItemText]}>{label}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    sentTokenItem: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.py_xs,
      ...atoms.px_md,
      borderRadius: 8,
      backgroundColor: color.primary_500,
    },
    receivedTokenItem: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.py_xs,
      ...atoms.px_md,
      borderRadius: 8,
      backgroundColor: color.secondary_300,
    },
    tokenSentItemText: {
      ...atoms.body_2_md_regular,
      color: color.white_static,
    },
    tokenReceivedItemText: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    notPrimarySentTokenItem: {
      backgroundColor: color.primary_100,
    },
    notPrimaryReceivedTokenItem: {
      backgroundColor: color.secondary_100,
    },
    notPrimarySentTokenItemText: {
      color: color.text_primary_medium,
    },
    notPrimaryReceivedTokenItemText: {
      color: color.secondary_700,
    },
  })

  return {styles} as const
}
