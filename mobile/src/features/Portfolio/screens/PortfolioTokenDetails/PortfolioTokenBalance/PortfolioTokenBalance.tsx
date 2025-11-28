import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {usePortfolioTokenDetailParams} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {LoadingBoundary} from '~/ui/Boundary/Boundary'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'

import {PortfolioTokenDetailBalanceSkeleton} from './PortfolioTokenDetailBalanceSkeleton'

export const PortfolioTokenBalance = () => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const balances = wallet.balances()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const tokenInfo = balances.records.get(tokenId)
  const tokenName = tokenInfo
    ? infoExtractName(tokenInfo.info, {mode: 'currency'})
    : '-'

  if (!tokenInfo) return <PortfolioTokenDetailBalanceSkeleton />

  return (
    <LoadingBoundary fallback={<PortfolioTokenDetailBalanceSkeleton />}>
      <View>
        <View style={[a.flex_row, a.gap_2xs, a.align_baseline]}>
          <Text
            style={[a.heading_1_medium, a.font_semibold, {color: p.gray_900}]}
          >
            {amountBreakdown(tokenInfo).bn.toFormat(2)}
          </Text>

          <Text
            style={[
              a.body_1_lg_medium,
              a.font_semibold,
              {color: p.text_gray_medium},
            ]}
          >
            {tokenName}
          </Text>
        </View>

        <PairedBalance
          textStyle={{...a.body_2_md_regular, color: p.gray_600}}
          ignorePrivacy
          amount={tokenInfo}
        />
      </View>
    </LoadingBoundary>
  )
}
