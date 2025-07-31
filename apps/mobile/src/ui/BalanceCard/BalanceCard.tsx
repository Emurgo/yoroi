import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {View} from 'react-native'

import {usePairing} from '~/features/Pairing/context/PairingProvider'
import {aggregatePrimaryAmount} from '~/features/Portfolio/common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {BalanceCardSkeleton} from '~/ui/BalanceCardSkeleton/BalanceCardSkeleton'
import {BalanceHeaderCard} from '~/ui/BalanceHeaderCard/BalanceHeaderCard'
import {BalanceCardContent} from '../BalanceCardContent/BalanceCardContent'

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
