import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, useWindowDimensions} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useStrings} from './hooks/useStrings'
import {TokenDetails} from './TokenDetails'

export const TokenItem = ({
  tokenInfo,
  isPrimaryToken = true,
  isSent = true,
  label,
}: {
  tokenInfo: Portfolio.Token.Info
  isPrimaryToken?: boolean
  isSent?: boolean
  label: string
}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowTokenDetails = () => {
    openModal(strings.tokenDetailsTitle, <TokenDetails tokenInfo={tokenInfo} />, windowHeight * 0.8)
  }

  if (!isSent)
    return (
      <TouchableOpacity
        onPress={handleShowTokenDetails}
        activeOpacity={0.5}
        style={[styles.receivedTokenItem, !isPrimaryToken && styles.notPrimaryReceivedTokenItem]}
        disabled={isPrimaryToken}
      >
        <Text style={[styles.tokenReceivedItemText, !isPrimaryToken && styles.notPrimaryReceivedTokenItemText]}>
          {label}
        </Text>
      </TouchableOpacity>
    )

  return (
    <TouchableOpacity
      onPress={handleShowTokenDetails}
      activeOpacity={0.5}
      style={[styles.sentTokenItem, !isPrimaryToken && styles.notPrimarySentTokenItem]}
      disabled={isPrimaryToken}
    >
      <Text style={[styles.tokenSentItemText, !isPrimaryToken && styles.notPrimarySentTokenItemText]}>-{label}</Text>
    </TouchableOpacity>
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
