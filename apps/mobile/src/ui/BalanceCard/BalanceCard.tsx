import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {View} from 'react-native'

import {usePairing} from '../../../../Pairing/context/PairingProvider'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'
import {aggregatePrimaryAmount} from '../../../common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '../../../context/PortfolioProvider'
import {BalanceCardContent} from '../BalanceCardContent/BalanceCardContent'
import {BalanceCardSkeleton} from './BalanceCardSkeleton'
import {BalanceHeaderCard} from './BalanceHeaderCard'

export const BalanceCard = () => {
  const {palette: p} = useTheme()

  const {
    wallet: {balances, portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const {tokenActivity, isLoading} = usePortfolioTokenActivity()

  const amount = React.useMemo(
    () =>
      aggregatePrimaryAmount({
        tokenAmountRecords: Object.fromEntries(balances.records.entries()),
        primaryTokenInfo: portfolioPrimaryTokenInfo,
        tokenActivity,
      }),
    [balances.records, portfolioPrimaryTokenInfo, tokenActivity],
  )

  const name = infoExtractName(portfolioPrimaryTokenInfo)
  const price = usePairing().ptActivity.close
  const hasDApps = false

  return (
    <View style={[a.px_lg]}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={[a.p_lg, a.rounded_sm]} colors={p.bg_gradient_3}>
          <BalanceCardContent
            amount={amount}
            headerCard={
              <BalanceHeaderCard rate={price} name={name} hasDApps={hasDApps} />
            }
          />
        </LinearGradient>
      )}
    </View>
  )
}
