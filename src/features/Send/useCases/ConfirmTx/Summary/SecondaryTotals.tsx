import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components/Boundary/Boundary'
import {Text} from '../../../../../components/Text'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {COLORS} from '../../../../../theme/config'
import {useToken} from '../../../../../yoroi-wallets/hooks'
import {YoroiAmount, YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils/utils'

export const SecondaryTotals = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const wallet = useSelectedWallet()
  const tokens = Amounts.remove(yoroiUnsignedTx.amounts, [wallet.primaryToken.identifier])

  return (
    <View>
      {Amounts.toArray(tokens)
        .sort((a, b) => (Quantities.isGreaterThan(a.quantity, b.quantity) ? -1 : 1))
        .map((amount) => (
          <Boundary key={amount.tokenId} loading={{size: 'small'}}>
            <Amount amount={amount} />
          </Boundary>
        ))}
    </View>
  )
}

const Amount = ({amount}: {amount: YoroiAmount}) => {
  const wallet = useSelectedWallet()
  const token = useToken({wallet, tokenId: amount.tokenId})

  return <Text style={styles.amount}>{formatTokenWithText(amount.quantity, token)}</Text>
}

const styles = StyleSheet.create({
  amount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})
