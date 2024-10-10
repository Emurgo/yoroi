import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'

import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {SkeletonPairedToken} from './SkeletonPairedToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryTokenActive: boolean
}
export const TokenValuePairedBalance = ({amount, isFetching, isPrimaryTokenActive}: Props) => {
  const {styles} = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const name = infoExtractName(amount.info)

  if (isFetching) return <SkeletonPairedToken />
  if (isPrimaryTokenActive) return <PairedBalance amount={amount} textStyle={styles.pairedBalance} />
  return (
    <Text style={[styles.pairedBalance]}>{`${
      isPrivacyActive ? privacyPlaceholder : amountBreakdown(amount).bn.toFormat(2)
    } ${name}`}</Text>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    pairedBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_600,
    },
  })

  return {styles} as const
}
