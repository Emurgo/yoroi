import {createUnknownTokenInfo, usePortfolioTokenInfo} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Balance, Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components/Boundary/Boundary'
import {Text} from '../../../../../components/Text'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {formatTokenWithText} from '../../../../../yoroi-wallets/utils/format'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const SecondaryTotals = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const {wallet} = useSelectedWallet()
  const secondaryAmounts = Amounts.remove(Amounts.getAmountsFromEntries(yoroiUnsignedTx.entries), [
    wallet.portfolioPrimaryTokenInfo.id,
  ])
  const sortedAmounts = Amounts.toArray(secondaryAmounts).sort((a, b) =>
    Quantities.isGreaterThan(a.quantity, b.quantity) ? -1 : 1,
  )

  return (
    <View>
      {sortedAmounts.map((amount) => (
        <Boundary key={amount.tokenId} loading={{size: 'small'}}>
          <Amount amount={amount} wallet={wallet} />
        </Boundary>
      ))}
    </View>
  )
}

const Amount = ({amount, wallet}: {amount: Balance.Amount; wallet: YoroiWallet}) => {
  const styles = useStyles()
  const {tokenInfo} = usePortfolioTokenInfo({
    network: wallet.networkManager.network,
    id: amount.tokenId as Portfolio.Token.Id,
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })

  const info =
    tokenInfo ??
    createUnknownTokenInfo({id: amount.tokenId as Portfolio.Token.Id, name: `Unknown token ${amount.tokenId}`})

  return <Text style={styles.amount}>{formatTokenWithText(amount.quantity, info)}</Text>
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    amount: {
      color: color.secondary_600,
    },
  })
  return styles
}
