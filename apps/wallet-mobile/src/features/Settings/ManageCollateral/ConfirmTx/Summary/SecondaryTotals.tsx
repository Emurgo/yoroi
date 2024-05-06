import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components/Boundary/Boundary'
import {Text} from '../../../../../components/Text'
import {formatTokenWithText} from '../../../../../legacy/format'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {useToken} from '../../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/Context'

export const SecondaryTotals = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const wallet = useSelectedWallet()
  const secondaryAmounts = Amounts.remove(Amounts.getAmountsFromEntries(yoroiUnsignedTx.entries), [
    wallet.primaryTokenInfo.id,
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
  const token = useToken({wallet, tokenId: amount.tokenId})

  return <Text style={styles.amount}>{formatTokenWithText(amount.quantity, token)}</Text>
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    amount: {
      color: color.secondary_c600,
    },
  })
  return styles
}
