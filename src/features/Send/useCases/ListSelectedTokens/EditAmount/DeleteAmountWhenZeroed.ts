import {useNavigation} from '@react-navigation/native'

import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {useSend} from '../../../common/SendContext'

export const useDeleteAmountWhenZeroed = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const {amountChanged, amountRemoved, selectedTokenId} = useSend()

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenId})

  return (inputAmount: string) => {
    console.error('useDeleteAmountWhenZeroed', asQuantity(inputAmount), Quantities.isZero(asQuantity(inputAmount)))
    if (Quantities.isZero(asQuantity(inputAmount))) {
      amountRemoved(selectedTokenId)
    } else {
      amountChanged(Quantities.atomic(inputAmount, tokenInfo.decimals))
    }
    navigation.navigate('send-list-selected-tokens')
  }
}
