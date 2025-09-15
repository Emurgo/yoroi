import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {Text} from 'react-native'

import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'

import {SkeletonPairedToken} from './SkeletonPairedToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryTokenActive: boolean
}
export const TokenValuePairedBalance = ({
  amount,
  isFetching,
  isPrimaryTokenActive,
}: Props) => {
  const {palette: p} = useTheme()
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()

  const name = infoExtractName(amount.info)

  if (isFetching) return <SkeletonPairedToken />
  if (isPrimaryTokenActive)
    return (
      <PairedBalance
        amount={amount}
        textStyle={{...a.body_2_md_regular, color: p.gray_600}}
      />
    )
  return (
    <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>{`${
      isPrivacyModeEnabled
        ? privacyPlaceholder
        : amountBreakdown(amount).bn.toFormat(2)
    } ${name}`}</Text>
  )
}
