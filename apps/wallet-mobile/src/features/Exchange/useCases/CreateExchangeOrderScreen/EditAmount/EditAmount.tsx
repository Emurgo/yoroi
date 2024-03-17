import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import BigNumber from 'bignumber.js'
import * as React from 'react'

import {useLanguage} from '../../../../../i18n'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useBalance, useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {AmountCard} from '../../../common/AmountCard/AmountCard'
import {useStrings} from '../../../common/useStrings'

export const EditAmount = () => {
  const wallet = useSelectedWallet()

  const tokenId = wallet.primaryTokenInfo.id
  const balance = useBalance({wallet, tokenId})
  const strings = useStrings()
  const amountTokenInfo = useTokenInfo({wallet, tokenId})
  const {numberLocale} = useLanguage()

  const {amount, orderType, amountInputChanged, provider, providerId} = useExchange()
  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})

  const onChangeAmountQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(text, amountTokenInfo.decimals ?? 0, numberLocale)
      const newValue = +quantity
      const displayValue = text === '' ? '' : input

      let inputErrorMessage = null

      if (orderType === 'sell') {
        const isNotEnoughBalance = new BigNumber(newValue).isGreaterThan(new BigNumber(balance))
        if (isNotEnoughBalance) inputErrorMessage = strings.notEnoughBalance
      }

      if (orderType === 'buy') {
        const providerSelected = Object.fromEntries(providers)[providerId]
        const minAda = providerSelected?.supportedOrders?.buy?.min ?? 0
        if (newValue > 0 && newValue < minAda && orderType === 'buy') inputErrorMessage = strings.minAdaRequired
      }

      const canExchange = inputErrorMessage == null && displayValue !== ''

      amountInputChanged(
        {
          ...amount,
          error: inputErrorMessage,
          displayValue,
          value: +quantity,
        },
        canExchange,
      )
    },
    [
      amountTokenInfo.decimals,
      numberLocale,
      balance,
      providers,
      providerId,
      orderType,
      strings.notEnoughBalance,
      strings.minAdaRequired,
      amountInputChanged,
      amount,
    ],
  )

  return (
    <AmountCard
      label={strings.amountTitle}
      onChange={onChangeAmountQuantity}
      value={amount.displayValue}
      touched={true}
      wallet={wallet}
      amount={{tokenId, quantity: balance}}
      error={amount.error ?? ''}
    />
  )
}
