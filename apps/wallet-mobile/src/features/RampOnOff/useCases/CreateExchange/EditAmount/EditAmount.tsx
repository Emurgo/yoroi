import * as React from 'react'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useBalance} from '../../../../../yoroi-wallets/hooks'
import {AmountCard} from '../../../common/AmountCard/AmountCard'
import {useRampOnOff} from '../../../common/RampOnOffProvider'
import {useStrings} from '../../../common/strings'

export const EditAmount = () => {
  const wallet = useSelectedWallet()

  const tokenId = wallet.primaryTokenInfo.id
  const balance = useBalance({wallet, tokenId})
  const strings = useStrings()

  const {
    amount: {isTouched: isAmountTouched, displayValue: amountDisplayValue, error},
    onChangeAmountQuantity,
    amountInputRef,
  } = useRampOnOff()

  return (
    <AmountCard
      label={strings.amountTitle}
      onChange={onChangeAmountQuantity}
      value={amountDisplayValue}
      error={error}
      inputRef={amountInputRef}
      touched={isAmountTouched}
      wallet={wallet}
      amount={{tokenId, quantity: balance}}
    />
  )
}
