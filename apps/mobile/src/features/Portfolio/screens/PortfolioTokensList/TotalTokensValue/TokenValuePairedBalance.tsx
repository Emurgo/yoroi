import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text} from 'react-native'

import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
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
  const {atoms: ta, palette: p} = useTheme()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const name = infoExtractName(amount.info)

  if (isFetching) return <SkeletonPairedToken />
  if (isPrimaryTokenActive)
    return (
      <PairedBalance
        amount={amount}
        textStyle={[a.body_2_md_regular, {color: p.gray_600}]}
      />
    )
  return (
    <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>{`${
      isPrivacyActive
        ? privacyPlaceholder
        : amountBreakdown(amount).bn.toFormat(2)
    } ${name}`}</Text>
  )
}
